"""OGP画像生成スクリプト (1200x630px)"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
from scipy.ndimage import gaussian_filter1d
import os

# --- Japanese font setup ---
matplotlib.rcParams['font.family'] = 'sans-serif'
# Try common Japanese fonts on Windows
for fn in ['Yu Gothic', 'Meiryo', 'MS Gothic', 'Noto Sans CJK JP']:
    try:
        matplotlib.rcParams['font.sans-serif'] = [fn, 'DejaVu Sans']
        fig_test = plt.figure()
        fig_test.text(0.5, 0.5, 'テスト')
        plt.close(fig_test)
        print(f"Using font: {fn}")
        break
    except:
        continue

# --- Data (from App.jsx) ---
MR = np.array([51.25, 53.75, 56.25, 58.75, 61.25, 63.75, 66.25, 68.75, 71.25, 73.75, 76.25])
KC = -2.48
KM = MR + KC

KG = {
    'A': np.array([1,1,0,0,4,9,44,56,116,104,59]),
    'B': np.array([0,0,0,0,3,7,34,44,68,50,23]),
    'C': np.array([0,0,0,0,2,4,18,44,73,52,43]),
    'D': np.array([0,0,1,0,0,7,37,57,66,56,21]),
    'E': np.array([0,0,1,0,4,9,28,60,82,51,36]),
}

kAll = sum(KG.values())
KPERM = 2728
KSC = KPERM / np.sum(kAll)

UNIS = [
    {'b': 67.5,  'r': np.array([0,0,0,0.01,0.05,0.12,0.35,0.65,0.75,0.78,0.80])},
    {'b': 63.75, 'r': np.array([0,0,0,0,0.01,0.03,0.06,0.08,0.10,0.10,0.08])},
    {'b': 65.0,  'r': np.array([0.01,0.02,0.05,0.10,0.20,0.35,0.40,0.20,0.08,0.04,0.02])},
]
RB = np.array([0.05,0.05,0.08,0.12,0.15,0.25,0.35,0.45,0.55,0.60,0.65])

def pp(x, b, k=0.55):
    return 1.0 / (1.0 + np.exp(-k * (x - b)))

def keioTd():
    td = np.zeros(11)
    for i in range(11):
        nd = sum(u['r'][i] * pp(KM[i], u['b']) for u in UNIS)
        b = min(nd + 0.02, 0.98)
        td[i] = b + (1 - b) * min(RB[i] * 0.80, 0.95)
    return td

kTd = keioTd()
kEnr = np.maximum(np.round(kAll * (1 - kTd) * KSC), 0)

# National univ data
titec = np.array([0,0,3,11,18,69,117,108,47,9,0])
osaka = np.array([0,1,15,49,142,254,181,73,5,0,0])  # 阪大理工系

# --- Smoothed histogram (step function + Gaussian blur) ---
def make_curve(data, mids, sigma_units=0.7):
    density = data / (np.sum(data) * 2.5)  # normalize to density
    # Build high-res step function from histogram bins
    x_fine = np.linspace(mids[0] - 6, mids[-1] + 6, 3000)
    y_fine = np.zeros_like(x_fine)
    bw = 2.5  # bin width
    for m, d in zip(mids, density):
        mask = (x_fine >= m - bw/2) & (x_fine < m + bw/2)
        y_fine[mask] = d
    # Gaussian smoothing (sigma in data units -> pixel units)
    dx = x_fine[1] - x_fine[0]
    sigma_px = sigma_units / dx
    y_smooth = gaussian_filter1d(y_fine, sigma=sigma_px)
    # Clip to display range
    mask = (x_fine >= 52) & (x_fine <= 78)
    return x_fine[mask], y_smooth[mask]

x_ke, y_ke = make_curve(kEnr, KM)
x_kp, y_kp = make_curve(kAll * KSC, KM)
x_ti, y_ti = make_curve(titec, MR)
x_os, y_os = make_curve(osaka, MR)

# Compute averages for display
keio_enr_avg = np.sum(kEnr * KM) / np.sum(kEnr)
keio_enr_n = int(np.sum(kEnr))

# --- Plot ---
BG = '#0b0b16'
fig = plt.figure(figsize=(12, 6.3), dpi=100)
fig.patch.set_facecolor(BG)

# Layout: text area (top 55%) + chart area (bottom 45%)
ax = fig.add_axes([0.06, 0.08, 0.90, 0.45])  # chart
ax.set_facecolor(BG)

# Plot KDE curves
ax.plot(x_kp, y_kp, color='#4488DD', linewidth=1.2, linestyle='--', alpha=0.5)
ax.plot(x_ke, y_ke, color='#4488DD', linewidth=2.5, label='慶應理工入学者')
ax.plot(x_ti, y_ti, color='#2ECC71', linewidth=2.0, label='東工大(情報除く)')
ax.plot(x_os, y_os, color='#E74C3C', linewidth=2.0, label='阪大理工系(情報除く)')

ax.fill_between(x_ke, y_ke, alpha=0.12, color='#4488DD')
ax.fill_between(x_ti, y_ti, alpha=0.08, color='#2ECC71')
ax.fill_between(x_os, y_os, alpha=0.08, color='#E74C3C')

ax.set_xlim(53, 76)
ax.set_ylim(0, None)
ax.set_xticks([55, 57.5, 60, 62.5, 65, 67.5, 70, 72.5, 75])
ax.tick_params(colors='#667788', labelsize=9)
ax.set_yticks([])
for spine in ['top', 'right', 'left']:
    ax.spines[spine].set_visible(False)
ax.spines['bottom'].set_color('#334455')

# Legend
leg = ax.legend(loc='upper right', fontsize=9, facecolor=BG, edgecolor='#334455',
                labelcolor='#aabbcc', framealpha=0.9)

# --- Text overlays ---
# Title
fig.text(0.06, 0.92, '早慶理工 入学者偏差値推定', fontsize=28, fontweight='bold',
         color='#ffffff', va='top')
# Subtitle
fig.text(0.06, 0.855, '公式入試統計2025 + 河合塾全統模試 + 駿台ベネッセ併願成功率',
         fontsize=10, color='#667788', va='top')

# Keio avg
fig.text(0.06, 0.79, '慶應理工', fontsize=14, color='#2ECC71', fontweight='bold', va='top')
fig.text(0.06, 0.72, f'{keio_enr_avg:.1f}', fontsize=42, color='#ffffff', fontweight='bold', va='top')
fig.text(0.22, 0.735, '入学者平均', fontsize=13, color='#889999', va='top')

# Waseda avg (hardcoded from App.jsx model)
fig.text(0.48, 0.79, '早稲田理工', fontsize=14, color='#2ECC71', fontweight='bold', va='top')
fig.text(0.48, 0.72, '65.7', fontsize=42, color='#ffffff', fontweight='bold', va='top')
fig.text(0.635, 0.735, '入学者平均', fontsize=13, color='#889999', va='top')

# Key insight
fig.text(0.06, 0.60, '入学者の約6割が東大不合格者', fontsize=16, color='#2ECC71',
         fontweight='bold', va='top')
fig.text(0.06, 0.545, '下位層は阪大理工系、上位層は東工大の分布に重なる幅広い学力帯',
         fontsize=13, color='#cccccc', va='top')

# URL
fig.text(0.06, 0.015, 'minuspiral.github.io/waseda-keio-compare', fontsize=9, color='#556666')

# Save
out = os.path.join(os.path.dirname(__file__), 'public', 'ogp.png')
fig.savefig(out, dpi=100, facecolor=BG, bbox_inches='tight', pad_inches=0.1)
plt.close()
print(f"Saved to {out}")
print(f"慶應入学者平均: {keio_enr_avg:.1f}, N={keio_enr_n}")
print(f"東工大: N={int(titec.sum())}, avg={np.sum(titec*MR)/titec.sum():.1f}")
print(f"阪大理工系: N={int(osaka.sum())}, avg={np.sum(osaka*MR)/osaka.sum():.1f}")
