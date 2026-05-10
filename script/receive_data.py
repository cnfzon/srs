import pygame
import sys
import datetime
import math
import time
import numpy as np
import cv2
import threading
import asyncio
import av
import json          
import base64        

# 硬體與神經網路模組
from ultralytics import YOLO
from openni import openni2
from openni import _openni2 as c_api
from networktables import NetworkTables

# 網路與遠端連線模組
import firebase_admin
from firebase_admin import credentials, db
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack, RTCConfiguration, RTCIceServer

# ==========================================
# 0. 全域日誌與狀態系統
# ==========================================
logs = [f"[{datetime.datetime.now().strftime('%H:%M:%S')}] SYSTEM BOOT COMPLETE..."]

def log_msg(msg):
    time_str = datetime.datetime.now().strftime('%H:%M:%S')
    logs.append(f"[{time_str}] {msg}")
    if len(logs) > 5: logs.pop(0)

global_detected_count = 0
global_target_cx = 320
global_target_cy = 240
global_robot_pos = 0.0  

# ⭐ 新增：防連點狀態鎖
is_auto_running = False
is_work_running = False

# ==========================================
# 1. 初始化 NetworkTables
# ==========================================
ROBOT_IP = "10.56.78.2"
print(f"正在嘗試連線到 VMX-pi ({ROBOT_IP})...")
NetworkTables.initialize(server=ROBOT_IP)
sd = NetworkTables.getTable("SmartDashboard")

# --- ⭐ 獨立的訊號重置輔助函數 ---
def reset_nt_cmd(cmd_name, delay=0.2):
    """延遲一小段時間後將 NT 變數重置為 False，確保動作不會無限重複"""
    time.sleep(delay)
    sd.putBoolean(cmd_name, False)

# ==========================================
# 2. 初始化 Firebase 與 WebRTC
# ==========================================
FIREBASE_CRED_PATH = "serviceAccountKey.json" 
FIREBASE_DB_URL = "https://srs-project-ed932-default-rtdb.asia-southeast1.firebasedatabase.app/"

print("初始化 Firebase...")
try:
    cred = credentials.Certificate(FIREBASE_CRED_PATH)
    firebase_admin.initialize_app(cred, {'databaseURL': FIREBASE_DB_URL})
    webrtc_ref = db.reference('webrtc_signaling')
    command_bridge_ref = db.reference('command_bridge')
    print("✅ Firebase 初始化成功！")
except Exception as e:
    print(f"❌ Firebase 初始化失敗: {e}")
    sys.exit()

# 1. 專門處理交握的監聽器
def handshake_listener(event):
    data = event.data
    if isinstance(data, dict) and data.get('cmd') == 'B' and data.get('src') == 'web':
        print("✅ [Command Bridge] 網頁端回應成功！收到 B。發送確認信號 C...")
        command_bridge_ref.update({'cmd': 'C', 'src': 'local'})
        log_msg("WEB: Handshake Confirmed (Link Live)")

command_bridge_ref.listen(handshake_listener)

# 2. 專門處理動作指令的 VIP 監聽器 (精準監聽 action_cmd)
def action_listener(event):
    action_payload_b64 = event.data
    
    if not action_payload_b64 or not isinstance(action_payload_b64, str): 
        return
        
    try:
        cmd_payload = json.loads(base64.b64decode(action_payload_b64).decode('utf-8'))
        action = cmd_payload.get('action')
        params = cmd_payload.get('params', {})
        
        print(f"📥 收到遠端指令: {action} | 參數: {params}")
        
        if action == 'MOVE':
            dist = float(params.get('dist', 0.0)) 
            sd.putNumber("Set_MoveDist", dist)
            sd.putBoolean("Set_MoveState", True)
            sd.putBoolean("Cmd_Move", True)
            log_msg(f"WEB-CMD: 執行遠端移動 {dist} cm")
            threading.Thread(target=reset_nt_cmd, args=("Cmd_Move",), daemon=True).start()
            
        elif action == 'GRAB':
            sd.putBoolean("Set_GripperState", True)
            sd.putBoolean("Cmd_Gripper", True)
            log_msg("WEB-CMD: 執行遠端夾取 (Close)")
            threading.Thread(target=reset_nt_cmd, args=("Cmd_Gripper",), daemon=True).start()
            
        elif action == 'RELEASE':
            sd.putBoolean("Set_GripperState", False)
            sd.putBoolean("Cmd_Gripper", True)
            log_msg("WEB-CMD: 執行遠端釋放 (Open)")
            threading.Thread(target=reset_nt_cmd, args=("Cmd_Gripper",), daemon=True).start()
            
        elif action == 'DETECT':
            sd.putBoolean("Cmd_DetectObject", True)
            log_msg("WEB-CMD: 觸發偵測 (Detect)")
            threading.Thread(target=reset_nt_cmd, args=("Cmd_DetectObject",), daemon=True).start()
            
        elif action == 'STANDBY':
            sd.putBoolean("Cmd_StandbyRotate", True)
            log_msg("WEB-CMD: 觸發待機 (Standby)")
            threading.Thread(target=reset_nt_cmd, args=("Cmd_StandbyRotate",), daemon=True).start()
            
        elif action == 'TAKE':
            sd.putBoolean("Cmd_Take", True)
            log_msg("WEB-CMD: 觸發拿取 (Take)")
            threading.Thread(target=reset_nt_cmd, args=("Cmd_Take",), daemon=True).start()
            
        elif action == 'ROTATE_FRONT':
            sd.putBoolean("Set_RotateDir", False)
            sd.putBoolean("Cmd_Rotate", True)
            log_msg("WEB-CMD: 轉向 前 (Front)")
            threading.Thread(target=reset_nt_cmd, args=("Cmd_Rotate",), daemon=True).start()
            
        elif action == 'ROTATE_BACK':
            sd.putBoolean("Set_RotateDir", True)
            sd.putBoolean("Cmd_Rotate", True)
            log_msg("WEB-CMD: 轉向 後 (Back)")
            threading.Thread(target=reset_nt_cmd, args=("Cmd_Rotate",), daemon=True).start()
            
        elif action == 'AUTO':
            cmd_auto()  
            log_msg("WEB-CMD: ⭐ 啟動 Auto 序列")
            
        elif action == 'WORK':
            cmd_work()  
            log_msg("WEB-CMD: 🔥 啟動 Work 序列")
            
        elif action == 'RESET':
            sd.putBoolean("Cmd_EmergencyStop", True) 
            sd.putBoolean("Cmd_Move", False)         
            log_msg("WEB-CMD: 🚨 觸發遠端緊急停止！")
            threading.Thread(target=reset_nt_cmd, args=("Cmd_EmergencyStop",), daemon=True).start()
            
    except Exception as e:
        print(f"❌ 遠端指令解析失敗: {e}")

db.reference('command_bridge/action_cmd').listen(action_listener)

# ==========================================
# --- WebRTC 影像串流設定 ---
# ==========================================
class YOLOVideoTrack(VideoStreamTrack):
    def __init__(self):
        super().__init__()
        self.current_frame = None

    def update_frame(self, frame):
        self.current_frame = frame

    async def recv(self):
        img = self.current_frame if self.current_frame is not None else np.zeros((480, 640, 3), dtype=np.uint8)
        frame = av.VideoFrame.from_ndarray(img, format="bgr24")
        pts, time_base = await self.next_timestamp()
        frame.pts = pts
        frame.time_base = time_base
        return frame

video_track = YOLOVideoTrack()

async def process_offer(offer_dict, loop):
    print("📥 正在處理新的 Offer...")
    ice_servers = [
        RTCIceServer(urls=["stun:stun.relay.metered.ca:80"]),
        RTCIceServer(
            urls=[
                "turn:global.relay.metered.ca:80",
                "turn:global.relay.metered.ca:80?transport=tcp",
                "turn:global.relay.metered.ca:443",
                "turns:global.relay.metered.ca:443?transport=tcp"
            ],
            username="e8ac4e6038d673af988e5ea0",
            credential="UsshpTl9q1N+3F3i"
        )
    ]
    
    config = RTCConfiguration(iceServers=ice_servers)
    new_pc = RTCPeerConnection(configuration=config)
    new_pc.addTrack(video_track)

    @new_pc.on("connectionstatechange")
    async def on_connectionstatechange():
        print(f"📡 WebRTC 連線狀態: {new_pc.connectionState}")
        if new_pc.connectionState in ["failed", "closed"]:
            await new_pc.close()

    try:
        offer = RTCSessionDescription(sdp=offer_dict['sdp'], type=offer_dict['type'])
        await new_pc.setRemoteDescription(offer)
        answer = await new_pc.createAnswer()
        await new_pc.setLocalDescription(answer)

        while new_pc.iceGatheringState != "complete":
            await asyncio.sleep(0.1)

        webrtc_ref.child('answer').set({
            'sdp': new_pc.localDescription.sdp,
            'type': new_pc.localDescription.type
        })
        print(f"✅ WebRTC 握手完成，已回傳 Answer")
    except Exception as e:
        print(f"❌ 建立連線錯誤: {e}")
        await new_pc.close()

async def run_webrtc_signaling(loop):
    print("📡 信令系統啟動...")
    webrtc_ref.child('offer').delete()
    webrtc_ref.child('answer').delete()

    def handle_offer(event):
        if event.data and isinstance(event.data, dict):
            if 'sdp' in event.data and event.data.get('type') == 'offer':
                asyncio.run_coroutine_threadsafe(process_offer(event.data, loop), loop)

    webrtc_ref.child('offer').listen(handle_offer)
    while True:
        await asyncio.sleep(1)

loop = asyncio.new_event_loop()
def start_async_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_until_complete(run_webrtc_signaling(loop))

threading.Thread(target=start_async_loop, args=(loop,), daemon=True).start()

# ==========================================
# 3. 初始化 YOLO 模型與 OpenNI2 深度鏡頭
# ==========================================
print("載入 YOLOv11 模型中...")
model = YOLO(r"D:\hackthon\project\version\verision_1\detect\runs\train\save_models\weights\best.pt") 
model.to("cuda")

dll_path = r"D:\hackthon\Orbbec_OpenNI_v2.3.0.86-beta6_windows_release\OpenNI_2.3.0.86_202210111950_4c8f5aa4_beta6_windows\Win64-Release\tools\NiViewer"
print("載入 OpenNI2 引擎...")
openni2.initialize(dll_path)

try:
    dev = openni2.Device.open_any()
    print("✅ 成功連接 3D 相機深度模組！")
    depth_stream = dev.create_depth_stream()
    depth_stream.set_video_mode(c_api.OniVideoMode(pixelFormat=c_api.OniPixelFormat.ONI_PIXEL_FORMAT_DEPTH_1_MM, resolutionX=640, resolutionY=480, fps=30))
    depth_stream.start()
except Exception as e:
    print(f"❌ 找不到深度相機，錯誤: {e}")
    openni2.unload()
    sys.exit()

# ==========================================
# 4. 定義多執行緒相機
# ==========================================
class ThreadedCamera:
    def __init__(self, src=0):
        self.cap = cv2.VideoCapture(src, cv2.CAP_DSHOW)
        fourcc = cv2.VideoWriter_fourcc(*'MJPG')
        self.cap.set(cv2.CAP_PROP_FOURCC, fourcc)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        self.ret, self.frame = self.cap.read()
        self.stopped = False
        self.thread = threading.Thread(target=self.update, args=())
        self.thread.daemon = True
        self.thread.start()

    def update(self):
        while not self.stopped:
            if self.cap.isOpened():
                self.ret, self.frame = self.cap.read()

    def read(self):
        return self.ret, self.frame

    def stop(self):
        self.stopped = True
        self.thread.join()
        self.cap.release()

cam = ThreadedCamera(src=0)

# ==========================================
# 5. 初始化 Pygame 與介面設定
# ==========================================
pygame.init()
WIDTH, HEIGHT = 840, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("機器視覺與 VMX-pi 控制介面")

WHITE, BLACK, GRAY, DARK_GRAY = (250, 250, 250), (20, 20, 20), (180, 180, 180), (100, 100, 100)
LIGHT_GRAY, RED, GREEN = (220, 220, 220), (220, 50, 50), (50, 200, 50)
BLUE, LIGHT_BLUE, BG_DARK = (50, 150, 255), (150, 200, 255), (30, 30, 30)
ORANGE = (255, 165, 0)

def get_retro_font(size, bold=False):
    return pygame.font.SysFont(["microsoftjhenghei", "mingliu", "simhei", "couriernew"], size, bold=bold)

font_sm = get_retro_font(14)
font_md = get_retro_font(18, True)
font_lg = get_retro_font(24, True)

def draw_text(surface, text, font, color, x, y):
    img = font.render(str(text), True, color)
    surface.blit(img, (x, y))

def draw_rect_radius(surface, color, rect, radius, border=0, border_color=GRAY):
    pygame.draw.rect(surface, color, rect, 0, radius)
    if border > 0:
        pygame.draw.rect(surface, border_color, rect, border, radius)

def cvimage_to_pygame(cv_image, width, height):
    img = cv2.resize(cv_image, (width, height))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = np.swapaxes(img, 0, 1)
    return pygame.surfarray.make_surface(img)

# ⭐ 修改：放開滑鼠才觸發的按鈕
class SimpleButton:
    def __init__(self, rect, text, action_func, bg_color=LIGHT_BLUE):
        self.rect = pygame.Rect(rect)
        self.text = text
        self.action_func = action_func
        self.bg_color = bg_color
        self.is_hovered = False
        self.is_pressed = False

    def handle_event(self, event):
        if event.type == pygame.MOUSEMOTION:
            self.is_hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            if self.is_hovered:
                self.is_pressed = True
        elif event.type == pygame.MOUSEBUTTONUP and event.button == 1:
            # 確保是在按鈕範圍內「按下並放開」才觸發
            if self.is_pressed and self.is_hovered:
                self.action_func() 
            self.is_pressed = False

    def draw(self, surface):
        color = BLUE if self.is_pressed else (self.bg_color if not self.is_hovered else WHITE)
        draw_rect_radius(surface, color, self.rect, 5, 2, DARK_GRAY)
        text_img = font_md.render(self.text, True, BLACK)
        surface.blit(text_img, (self.rect.centerx - text_img.get_width()//2, self.rect.centery - text_img.get_height()//2))

class ToggleButton:
    def __init__(self, rect, text_false, text_true):
        self.rect = pygame.Rect(rect)
        self.text_false = text_false
        self.text_true = text_true
        self.state = False
        self.is_hovered = False

    def handle_event(self, event):
        if event.type == pygame.MOUSEMOTION:
            self.is_hovered = self.rect.collidepoint(event.pos)
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            if self.is_hovered:
                self.state = not self.state

    def draw(self, surface):
        color = GREEN if self.state else GRAY
        if self.is_hovered: color = tuple(min(255, c + 30) for c in color)
        draw_rect_radius(surface, color, self.rect, 5, 2, DARK_GRAY)
        text = self.text_true if self.state else self.text_false
        text_img = font_md.render(text, True, BLACK)
        surface.blit(text_img, (self.rect.centerx - text_img.get_width()//2, self.rect.centery - text_img.get_height()//2))

class RoundedInputField:
    def __init__(self, rect, label, start_text=""):
        self.rect = pygame.Rect(rect)
        self.label = label
        self.text = start_text
        self.is_active = False

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            self.is_active = self.rect.collidepoint(event.pos)
        elif event.type == pygame.KEYDOWN and self.is_active:
            if event.key == pygame.K_BACKSPACE:
                self.text = self.text[:-1]
            elif event.key == pygame.K_RETURN:
                self.is_active = False
            elif event.unicode.isprintable():
                self.text += event.unicode

    def draw(self, surface):
        draw_text(surface, self.label, font_sm, BLACK, self.rect.x, self.rect.y - 18)
        draw_rect_radius(surface, WHITE, self.rect, 5, 2, BLUE if self.is_active else GRAY)
        text_img = font_md.render(self.text, True, BLACK)
        surface.blit(text_img, (self.rect.x + 5, self.rect.y + 4))
        if self.is_active and (pygame.time.get_ticks() % 1000 < 500):
            cursor_x = self.rect.x + 5 + text_img.get_width()
            pygame.draw.line(surface, BLACK, (cursor_x, self.rect.y + 5), (cursor_x, self.rect.y + self.rect.height - 5), 2)

# --- ⭐ 修改：按鈕事件定義 (加入單次脈衝邏輯) ---
def cmd_detect(): 
    sd.putBoolean("Cmd_DetectObject", True)
    log_msg("NT: Triggered Detect Object")
    threading.Thread(target=reset_nt_cmd, args=("Cmd_DetectObject",), daemon=True).start()

def cmd_standby(): 
    sd.putBoolean("Cmd_StandbyRotate", True)
    log_msg("NT: Triggered Standby")
    threading.Thread(target=reset_nt_cmd, args=("Cmd_StandbyRotate",), daemon=True).start()

def cmd_take(): 
    sd.putBoolean("Cmd_Take", True)
    log_msg("NT: Triggered Take")
    threading.Thread(target=reset_nt_cmd, args=("Cmd_Take",), daemon=True).start()

def cmd_rotate():
    sd.putBoolean("Set_RotateDir", toggle_rotate.state)
    sd.putBoolean("Cmd_Rotate", True)
    log_msg(f"NT: Rotate ({'Back' if toggle_rotate.state else 'Front'})")
    threading.Thread(target=reset_nt_cmd, args=("Cmd_Rotate",), daemon=True).start()

def cmd_gripper():
    sd.putBoolean("Set_GripperState", toggle_gripper.state)
    sd.putBoolean("Cmd_Gripper", True)
    log_msg(f"NT: Gripper ({'Close' if toggle_gripper.state else 'Open'})")
    threading.Thread(target=reset_nt_cmd, args=("Cmd_Gripper",), daemon=True).start()

def cmd_move():
    try:
        dist = float(input_move.text)
        sd.putNumber("Set_MoveDist", dist)
        sd.putBoolean("Set_MoveState", True)
        sd.putBoolean("Cmd_Move", True)
        log_msg(f"NT: Move (Dist: {dist})")
        threading.Thread(target=reset_nt_cmd, args=("Cmd_Move",), daemon=True).start()
    except ValueError:
        log_msg("ERROR: Move Dist must be a number!")

# ------------------------------------------
# ⭐ Auto 與 Work 自動程序執行緒 (加入狀態鎖)
# ------------------------------------------
def auto_sequence_thread():
    global global_robot_pos, is_auto_running
    log_msg("AUTO: 開始執行自動程序...")
    cmd_detect(); time.sleep(1)
    cmd_take(); time.sleep(1)
    
    sd.putBoolean("Set_GripperState", True); sd.putBoolean("Cmd_Gripper", True); log_msg("NT (Auto): Gripper (Close)"); time.sleep(1)
    cmd_standby(); time.sleep(1)
    
    sd.putBoolean("Set_RotateDir", True); sd.putBoolean("Cmd_Rotate", True); log_msg("NT (Auto): Rotate (Back)"); time.sleep(3)
    sd.putBoolean("Set_GripperState", False); sd.putBoolean("Cmd_Gripper", True); log_msg("NT (Auto): Gripper (Open)"); time.sleep(1)
    sd.putBoolean("Set_RotateDir", False); sd.putBoolean("Cmd_Rotate", True); log_msg("NT (Auto): Rotate (Front)"); time.sleep(3)
    
    global_robot_pos = 8.0
    step_dist = 4.0 
    global_robot_pos += step_dist 
    
    sd.putBoolean("Cmd_Move", False)
    time.sleep(0.05)
    
    sd.putNumber("Set_MoveDist", float(global_robot_pos))
    sd.putBoolean("Set_MoveState", True)
    sd.putBoolean("Cmd_Move", True)
    log_msg(f"NT (Auto): Move X {step_dist}cm (目標座標: {global_robot_pos})")
    time.sleep(2) 
        
    cmd_detect(); time.sleep(1.0) 
    log_msg("AUTO: 自動程序執行完畢！")
    is_auto_running = False # 解除鎖定

def cmd_auto(): 
    global is_auto_running
    if not is_auto_running:
        is_auto_running = True
        threading.Thread(target=auto_sequence_thread, daemon=True).start()
    else:
        log_msg("WARN: Auto 程序已經在執行中，請勿重複點擊！")

def work_sequence_thread():
    global global_robot_pos, is_work_running
    log_msg("WORK: 開始執行全自動連續夾取程序 (三段變速版)...")
    
    while True: # 如果未來需要可以透過按鈕中斷，可將 True 改為 is_work_running
        log_msg("WORK: 啟動新一輪辨識任務...")
        cmd_detect()
        time.sleep(1.0) 
        
        last_cx, last_cy = global_target_cx, global_target_cy
        stable_start_time = time.time()
        STABLE_THRESHOLD = 30  
        WAIT_TIME = 2.0

        log_msg("WORK: 等待目標靜止中...")
        while True:
            if global_detected_count == 0:
                stable_start_time = time.time()
                time.sleep(0.5); continue
            dist_moved = math.hypot(global_target_cx - last_cx, global_target_cy - last_cy)
            if dist_moved > STABLE_THRESHOLD:
                stable_start_time = time.time(); last_cx, last_cy = global_target_cx, global_target_cy
                time.sleep(0.1); continue
            if time.time() - stable_start_time >= WAIT_TIME: break 
            time.sleep(0.1)
            
        cam_cx, cam_cy = 320, 240
        target_cx = global_target_cx
        error_x = target_cx - cam_cx
        
        if abs(error_x) <= 15:
            log_msg("WORK: ✅ X 軸已精準對齊，準備執行夾取程序！")
        else:
            raw_dist = round(error_x / 16.0, 2)
            abs_dist = abs(raw_dist)
            if abs_dist > 10.0: move_type = "大移動"; step_dist = min(raw_dist, 30.0) if raw_dist > 0 else max(raw_dist, -30.0)
            elif abs_dist > 6.0: move_type = "正常移動"; step_dist = raw_dist
            else: move_type = "小移動"; step_dist = max(2.5, raw_dist) if raw_dist > 0 else min(-2.5, raw_dist)
            
            global_robot_pos += step_dist
            sd.putBoolean("Cmd_Move", False)  
            time.sleep(0.05) 
            sd.putNumber("Set_MoveDist", float(global_robot_pos))
            sd.putBoolean("Set_MoveState", True) 
            sd.putBoolean("Cmd_Move", True)
            log_msg(f"WORK: [{move_type}] 往{'右' if step_dist > 0 else '左'}移動 {abs(step_dist):.2f} cm")
            time.sleep(3.0) 
            continue 

        log_msg("WORK: 目標鎖定，啟動拿取物件程序...")
        cmd_take(); time.sleep(1)
        sd.putBoolean("Set_GripperState", True); sd.putBoolean("Cmd_Gripper", True); time.sleep(1)
        cmd_standby(); time.sleep(1)
        sd.putBoolean("Set_RotateDir", True); sd.putBoolean("Cmd_Rotate", True); time.sleep(3)
        sd.putBoolean("Set_GripperState", False); sd.putBoolean("Cmd_Gripper", True); time.sleep(1)
        sd.putBoolean("Set_RotateDir", False); sd.putBoolean("Cmd_Rotate", True); time.sleep(3)

        sd.putNumber("Set_MoveDist", float(8.0))
        sd.putBoolean("Set_MoveState", True) 
        sd.putBoolean("Cmd_Move", True)
        time.sleep(3)
            
        log_msg("WORK: 單次夾取任務完成！準備下一次辨識...")
        cmd_detect(); time.sleep(1.0) 
      
def cmd_work(): 
    global is_work_running
    if not is_work_running:
        is_work_running = True
        threading.Thread(target=work_sequence_thread, daemon=True).start()
    else:
        log_msg("WARN: Work 程序已經在執行中！")

# --- 建立 UI 版面與元件 ---
clock = pygame.time.Clock()

rect_A = pygame.Rect(0, 0, 640, 480)
rect_B = pygame.Rect(640, 0, 200, 480)
rect_C = pygame.Rect(0, 480, 840, 60) 
rect_D = pygame.Rect(0, 540, 840, 60)

btn_detect = SimpleButton((650, 40, 180, 35), "偵測物件 (Detect)", cmd_detect)
btn_standby = SimpleButton((650, 85, 180, 35), "待機模式 (Standby)", cmd_standby)
btn_take = SimpleButton((650, 130, 180, 35), "拿取物件 (Take)", cmd_take)
toggle_rotate = ToggleButton((650, 190, 85, 35), "前 (0)", "後 (1)")
btn_rotate = SimpleButton((745, 190, 85, 35), "執行轉向", cmd_rotate, bg_color=LIGHT_GRAY)
toggle_gripper = ToggleButton((650, 245, 85, 35), "放開 (0)", "夾緊 (1)")
btn_gripper = SimpleButton((745, 245, 85, 35), "執行夾爪", cmd_gripper, bg_color=LIGHT_GRAY)
input_move = RoundedInputField((650, 315, 180, 30), "距離 (Dist) - 正右/負左", "15.0")
btn_move = SimpleButton((650, 355, 180, 35), "執行移動 (Move)", cmd_move, bg_color=LIGHT_GRAY)
btn_auto = SimpleButton((650, 395, 180, 35), "⭐ 執行 Auto ⭐", cmd_auto, bg_color=ORANGE)
btn_work = SimpleButton((650, 435, 180, 35), "🔥 執行 Work 🔥", cmd_work, bg_color=RED)

ui_elements = [btn_detect, btn_standby, btn_take, toggle_rotate, btn_rotate, 
               toggle_gripper, btn_gripper, input_move, btn_move, btn_auto, btn_work]

sys_status = "IDLE"
sys_coord = "(0, 0, 0)"
sys_count = "00"
sys_conf = "0.00"

# ==========================================
# 上傳 Base64 Sensor Data 
# ==========================================
last_upload_time = 0
UPLOAD_INTERVAL = 1.0  
is_first_payload = True 

def upload_base64_sensor_data(sensor_dict, is_first):
    try:
        base64_payload = base64.b64encode(json.dumps(sensor_dict).encode('utf-8')).decode('utf-8')
        update_data = {
            'ts': int(time.time() * 1000),
            'payload': base64_payload
        }
        if is_first:
            update_data['cmd'] = 'A'
            update_data['src'] = 'local'
        command_bridge_ref.update(update_data)
    except Exception as e:
        pass 

# ==========================================
# 6. 主迴圈
# ==========================================
running = True
while running:
    # A. 事件處理
    for event in pygame.event.get():
        if event.type == pygame.QUIT: running = False
        for element in ui_elements:
            element.handle_event(event)

    screen.fill(WHITE)

    # B. 讀取影像與 YOLO 推論
    ret, color_image = cam.read()
    depth_frame = depth_stream.read_frame()
    
    dist_mm = 0.0  
    best_cx, best_cy = 320, 240
    cam_center_x, cam_center_y = 320, 240
    detected_count = 0
    current_status = sys_status

    if ret and depth_frame.height > 0:
        raw_depth_data = np.ctypeslib.as_array(depth_frame.get_buffer_as_uint16())
        depth_data = raw_depth_data.reshape(depth_frame.height, depth_frame.width)
        
        results = model(color_image, conf=0.8, device='cuda', verbose=False) 
        annotated_frame = results[0].plot()

        detected_count = len(results[0].boxes) if results[0].boxes else 0
        sys_count = f"{detected_count:02d}"
        
        if detected_count > 0:
            closest_dist = float('inf')
            best_box = None
            
            for box in results[0].boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                
                dist_to_center_x = abs(cx - cam_center_x)
                if dist_to_center_x < closest_dist:
                    closest_dist = dist_to_center_x
                    best_box = box
                    best_cx, best_cy = cx, cy
            
            global_target_cx = best_cx
            global_target_cy = best_cy
            global_detected_count = detected_count
            
            cls_id = int(best_box.cls[0])
            sys_status = results[0].names[cls_id].upper()
            sys_conf = f"{float(best_box.conf[0]):.2f}"
            current_status = sys_status
            
            depth_h, depth_w = depth_data.shape
            color_h, color_w = color_image.shape[:2]
            mapped_x, mapped_y = int(best_cx * (depth_w / color_w)), int(best_cy * (depth_h / color_h))

            if 0 <= mapped_y < depth_h and 0 <= mapped_x < depth_w:
                dist_mm = float(depth_data[mapped_y, mapped_x])
                sys_coord = f"({best_cx}, {best_cy}, {dist_mm})"
                
                cv2.circle(annotated_frame, (best_cx, best_cy), 5, (0, 0, 255), -1)
                display_text = f"{dist_mm} mm" if dist_mm > 0 else "Too Close!"
                cv2.putText(annotated_frame, display_text, (best_cx + 10, best_cy - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
                cv2.line(annotated_frame, (cam_center_x, cam_center_y), (best_cx, best_cy), (0, 255, 0), 2)

                live_err_x = best_cx - cam_center_x
                live_move_cm = round(live_err_x / 16, 2)
                
                info_text = f"Err X: {live_err_x} px -> Move: {live_move_cm} cm"
                cv2.putText(annotated_frame, info_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 255), 2)
                
                mid_x = (cam_center_x + best_cx) // 2
                mid_y = (cam_center_y + best_cy) // 2
                cv2.putText(annotated_frame, f"X:{live_err_x}px", (mid_x, mid_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        else:
            sys_status = "DETECTING..."
            current_status = "detecting"
            sys_coord = "(0, 0, 0)"
            sys_conf = "0.00"

        cv2.line(annotated_frame, (0, cam_center_y), (640, cam_center_y), (255, 255, 0), 2)
        cv2.circle(annotated_frame, (cam_center_x, cam_center_y), 5, (0, 0, 255), -1)
        
        # 傳給 WebRTC
        video_track.update_frame(annotated_frame)

        current_time = time.time()
        if current_time - last_upload_time > UPLOAD_INTERVAL:
            sensor_data_dict = {
                "timestamp": datetime.datetime.now().isoformat(),
                "camera_coordinates": {"x": float(cam_center_x), "y": float(cam_center_y)},
                "target_coordinates": {"x": float(best_cx), "y": float(best_cy), "z": float(dist_mm)},
                "target_confidence": float(sys_conf),
                "total_quantity": detected_count,
                "status": "detection" if detected_count > 0 else "idle"
            }
            
            threading.Thread(target=upload_base64_sensor_data, args=(sensor_data_dict, is_first_payload), daemon=True).start()
            
            is_first_payload = False 
            last_upload_time = current_time

        cam_surf = cvimage_to_pygame(annotated_frame, rect_A.width, rect_A.height)
        screen.blit(cam_surf, (0, 0))
    else:
        draw_rect_radius(screen, BG_DARK, rect_A, 0)
        draw_text(screen, "CAMERA SENSOR OFFLINE", font_lg, GRAY, 160, 230)
    
    pygame.draw.rect(screen, GRAY, rect_A, 2)

    # C. 繪製右側控制面板
    pygame.draw.rect(screen, WHITE, rect_B)
    nt_connected = NetworkTables.isConnected()
    conn_color = GREEN if nt_connected else ORANGE
    conn_text = "NT: CONNECTED" if nt_connected else "NT: SEARCHING..."
    draw_text(screen, conn_text, font_md, conn_color, 650, 10)
    pygame.draw.line(screen, GRAY, (650, 33), (830, 33), 2)
    pygame.draw.line(screen, GRAY, (650, 175), (830, 175), 2)

    for element in ui_elements: element.draw(screen)
    pygame.draw.rect(screen, GRAY, rect_B, 2)

    # D. 繪製狀態資訊列
    pygame.draw.rect(screen, WHITE, rect_C)
    draw_text(screen, f"STATUS: {sys_status}", font_md, BLACK, 20, 490)
    draw_text(screen, f"TARGET: {sys_coord}", font_md, BLACK, 250, 490) 
    draw_text(screen, f"COUNT: {sys_count}", font_md, BLACK, 650, 490)
    draw_text(screen, f"CONF:   {sys_conf}", font_md, BLACK, 20, 515)
    
    if global_detected_count > 0:
        current_err_x = global_target_cx - 320
        track_info = f"CAM: (320, 240) | ERR_X: {current_err_x}"
        info_color = GREEN if abs(current_err_x) <= 20 else RED
        draw_text(screen, track_info, font_md, info_color, 250, 515)
    else:
        draw_text(screen, "CAM: (320, 240) | ERR_X: N/A", font_md, GRAY, 250, 515)

    pygame.draw.rect(screen, GRAY, rect_C, 2)

    # E. 繪製即時日誌列
    pygame.draw.rect(screen, WHITE, rect_D)
    if len(logs) > 0:
        draw_text(screen, logs[-2] if len(logs) > 1 else "", font_sm, DARK_GRAY, 10, 550)
        draw_text(screen, logs[-1], font_sm, BLACK, 10, 575)
    pygame.draw.rect(screen, GRAY, rect_D, 2)

    pygame.display.flip()
    clock.tick(30)

# ==========================================
# 7. 安全釋放資源
# ==========================================
print("\n釋放硬體資源並關閉系統...")
cam.stop()
depth_stream.stop()
openni2.unload()
pygame.quit()
sys.exit()