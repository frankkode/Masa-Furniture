"""
Masa Furniture Store — Diagram Generator
Generates all 6 architecture diagrams as high-quality PNG files.
"""
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as pe
import numpy as np
import os

OUT = "/sessions/awesome-great-galileo/mnt/Getting started in Web Programming/Masa-Furniture/docs/diagrams"
os.makedirs(OUT, exist_ok=True)

DPI = 150
FONT = "DejaVu Sans"

# ─────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────
def rounded_box(ax, x, y, w, h, color, ec, lw=1.5, radius=0.012, zorder=2, alpha=1.0):
    box = FancyBboxPatch((x, y), w, h,
        boxstyle=f"round,pad=0,rounding_size={radius}",
        facecolor=color, edgecolor=ec, linewidth=lw, zorder=zorder, alpha=alpha)
    ax.add_patch(box)
    return box

def header_box(ax, x, y, w, h, fill, ec, text, tc='white', fs=10, lw=2, zorder=3):
    rounded_box(ax, x, y, w, h, fill, ec, lw=lw, zorder=zorder)
    ax.text(x + w/2, y + h/2, text, ha='center', va='center',
            fontsize=fs, fontweight='bold', color=tc, fontfamily=FONT, zorder=zorder+1)

def row_box(ax, x, y, w, h, fill, ec, label_left, label_right, lfs=9, rfs=9, zorder=3):
    rounded_box(ax, x, y, w, h, fill, ec, lw=0.8, zorder=zorder)
    ax.text(x + 0.008, y + h/2, label_left, ha='left', va='center',
            fontsize=lfs, fontweight='bold', color='#37474F', fontfamily=FONT, zorder=zorder+1)
    ax.text(x + 0.055, y + h/2, label_right, ha='left', va='center',
            fontsize=rfs, color='#212121', fontfamily=FONT, zorder=zorder+1)

def arrow(ax, x1, y1, x2, y2, color='#455A64', lw=2, style='->', zorder=4):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle=style, color=color, lw=lw,
                        connectionstyle='arc3,rad=0.0'),
        zorder=zorder)

def label_arrow(ax, x1, y1, x2, y2, text, color='#B71C1C', fs=8, zorder=4):
    mx, my = (x1+x2)/2, (y1+y2)/2
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle='<->', color=color, lw=2.2), zorder=zorder)
    ax.text(mx, my, text, ha='center', va='bottom', fontsize=fs,
            fontweight='bold', color=color, fontfamily=FONT, zorder=zorder+1,
            bbox=dict(boxstyle='round,pad=0.2', facecolor='white', edgecolor=color, lw=0.8))

def source_note(ax, text="Source: Own implementation. Frank Masabo, IU Internationale Hochschule, 2026."):
    ax.text(0.01, 0.012, text, transform=ax.transAxes,
            fontsize=7.5, style='italic', color='#78909C', fontfamily=FONT,
            va='bottom', ha='left')

# ─────────────────────────────────────────────────────────────────
# FIG 7 — ERD
# ─────────────────────────────────────────────────────────────────
def make_erd():
    fig, ax = plt.subplots(figsize=(13, 9))
    fig.patch.set_facecolor('white')
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.axis('off')

    # Title
    ax.text(0.5, 0.96, "Figure 7 — Entity Relationship Diagram",
            ha='center', va='top', fontsize=14, fontweight='bold',
            color='#1A237E', fontfamily=FONT)
    ax.text(0.5, 0.925, "Masa Furniture Store · SQLite 3 · better-sqlite3",
            ha='center', va='top', fontsize=10, color='#3949AB', fontfamily=FONT)

    # ── PRODUCTS TABLE ──
    px, py, pw, ph = 0.04, 0.18, 0.38, 0.68
    row_h = 0.075
    header_box(ax, px, py + ph - 0.072, pw, 0.072,
               '#1565C0', '#0D47A1', 'products', tc='white', fs=12, lw=2.5)

    p_rows = [
        ('PK', 'id  —  INTEGER AUTOINCREMENT', '#BBDEFB', '#90CAF9'),
        ('',   'name  —  TEXT NOT NULL',        'white',   '#90CAF9'),
        ('',   'price  —  REAL NOT NULL',        '#E3F2FD', '#90CAF9'),
        ('',   'image_url  —  TEXT',             'white',   '#90CAF9'),
        ('',   'category  —  TEXT',              '#E3F2FD', '#90CAF9'),
        ('',   'stock  —  INTEGER DEFAULT 0',    'white',   '#90CAF9'),
        ('',   'description  —  TEXT',           '#E3F2FD', '#90CAF9'),
        ('',   'material  —  TEXT',              'white',   '#90CAF9'),
    ]
    for i, (lbl, txt, bg, ec) in enumerate(p_rows):
        ry = py + ph - 0.072 - (i+1)*row_h
        rounded_box(ax, px, ry, pw, row_h, bg, ec, lw=0.6, zorder=3)
        if lbl:
            rounded_box(ax, px, ry, 0.06, row_h, '#BBDEFB', '#90CAF9', lw=0.6, zorder=4)
            ax.text(px + 0.03, ry + row_h/2, lbl, ha='center', va='center',
                    fontsize=8.5, fontweight='bold', color='#1A237E', fontfamily=FONT, zorder=5)
        ax.text(px + 0.072, ry + row_h/2, txt, ha='left', va='center',
                fontsize=9, color='#212121', fontfamily=FONT, zorder=5)

    # ── ORDERS TABLE ──
    ox, oy, ow, oh = 0.58, 0.62, 0.38, 0.30
    header_box(ax, ox, oy + oh - 0.072, ow, 0.072,
               '#2E7D32', '#1B5E20', 'orders', tc='white', fs=12, lw=2.5)
    o_rows = [
        ('PK', 'id  —  INTEGER AUTOINCREMENT', '#C8E6C9', '#A5D6A7'),
        ('',   'user_id  —  INTEGER (FK)',      'white',   '#A5D6A7'),
        ('',   'total_price  —  REAL NOT NULL', '#E8F5E9', '#A5D6A7'),
        ('',   'status  —  TEXT',               'white',   '#A5D6A7'),
        ('',   'stripe_pi  —  TEXT',            '#E8F5E9', '#A5D6A7'),
        ('',   'created_at  —  DATETIME',       'white',   '#A5D6A7'),
    ]
    for i, (lbl, txt, bg, ec) in enumerate(o_rows):
        ry = oy + oh - 0.072 - (i+1)*0.072
        if ry < oy: break
        rounded_box(ax, ox, ry, ow, 0.072, bg, ec, lw=0.6, zorder=3)
        if lbl:
            rounded_box(ax, ox, ry, 0.06, 0.072, '#C8E6C9', '#A5D6A7', lw=0.6, zorder=4)
            ax.text(ox+0.03, ry+0.036, lbl, ha='center', va='center',
                    fontsize=8.5, fontweight='bold', color='#1B5E20', fontfamily=FONT, zorder=5)
        ax.text(ox+0.072, ry+0.036, txt, ha='left', va='center',
                fontsize=9, color='#212121', fontfamily=FONT, zorder=5)

    # ── ORDER_ITEMS TABLE ──
    ix, iy, iw, ih = 0.58, 0.10, 0.38, 0.42
    header_box(ax, ix, iy + ih - 0.072, iw, 0.072,
               '#E65100', '#BF360C', 'order_items', tc='white', fs=12, lw=2.5)
    i_rows = [
        ('PK', 'id  —  INTEGER AUTOINCREMENT', '#FFCCBC', '#FFAB91'),
        ('FK', 'order_id  —  INTEGER NOT NULL', '#FFF3E0', '#FFCCBC'),
        ('FK', 'product_id  —  INTEGER NOT NULL', '#FFCCBC', '#FFAB91'),
        ('',   'quantity  —  INTEGER NOT NULL',  'white',   '#FFCCBC'),
        ('',   'price  —  REAL (snapshot)',       '#FBE9E7', '#FFCCBC'),
    ]
    for i, (lbl, txt, bg, ec) in enumerate(i_rows):
        ry = iy + ih - 0.072 - (i+1)*0.072
        rounded_box(ax, ix, ry, iw, 0.072, bg, ec, lw=0.6, zorder=3)
        if lbl:
            lbl_c = '#FFCCBC' if lbl == 'FK' else '#FFF3E0'
            lbl_tc = '#E65100' if lbl == 'FK' else '#1A237E'
            rounded_box(ax, ix, ry, 0.06, 0.072, lbl_c, '#FFCCBC', lw=0.6, zorder=4)
            ax.text(ix+0.03, ry+0.036, lbl, ha='center', va='center',
                    fontsize=8.5, fontweight='bold', color=lbl_tc, fontfamily=FONT, zorder=5)
        ax.text(ix+0.072, ry+0.036, txt, ha='left', va='center',
                fontsize=9, color='#212121', fontfamily=FONT, zorder=5)

    # ── USERS TABLE ──
    ux, uy, uw, uh = 0.04, 0.72, 0.38, 0.14
    header_box(ax, ux, uy + uh - 0.072, uw, 0.072,
               '#6A1B9A', '#4A148C', 'users', tc='white', fs=12, lw=2.5)
    rounded_box(ax, ux, uy, uw, 0.072, '#F3E5F5', '#CE93D8', lw=0.6, zorder=3)
    rounded_box(ax, ux, uy, 0.06, 0.072, '#E1BEE7', '#CE93D8', lw=0.6, zorder=4)
    ax.text(ux+0.03, uy+0.036, 'PK', ha='center', va='center',
            fontsize=8.5, fontweight='bold', color='#4A148C', fontfamily=FONT, zorder=5)
    ax.text(ux+0.072, uy+0.036, 'id  —  INTEGER AUTOINCREMENT', ha='left', va='center',
            fontsize=9, color='#212121', fontfamily=FONT, zorder=5)

    # ── RELATIONSHIPS ──
    # users → orders
    ax.annotate('', xy=(ox, oy + oh - 0.108), xytext=(ux + uw, uy + uh - 0.108),
        arrowprops=dict(arrowstyle='->', color='#6A1B9A', lw=2,
                        connectionstyle='arc3,rad=0.0'), zorder=6)
    ax.text(0.51, oy + oh - 0.108 + 0.01, '1 : N', ha='center', va='bottom',
            fontsize=8, fontweight='bold', color='#6A1B9A', fontfamily=FONT,
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#F3E5F5', edgecolor='#CE93D8', lw=0.8))

    # products → order_items
    ax.annotate('', xy=(ix, iy + ih - 0.144), xytext=(px + pw, py + ph - 0.252),
        arrowprops=dict(arrowstyle='->', color='#1565C0', lw=2,
                        connectionstyle='arc3,rad=0.0'), zorder=6)
    ax.text(0.51, (iy + ih - 0.144 + py + ph - 0.252)/2 - 0.01, '1 : N\nreferenced in',
            ha='center', va='top', fontsize=7.5, fontweight='bold', color='#1565C0',
            fontfamily=FONT,
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#E3F2FD', edgecolor='#90CAF9', lw=0.8))

    # orders → order_items
    ax.annotate('', xy=(ix, iy + ih - 0.072), xytext=(ox, oy),
        arrowprops=dict(arrowstyle='->', color='#2E7D32', lw=2,
                        connectionstyle='arc3,rad=0.0'), zorder=6)
    ax.text(0.575, (iy + ih - 0.072 + oy)/2, '1 : N\ncontains',
            ha='left', va='center', fontsize=7.5, fontweight='bold', color='#2E7D32',
            fontfamily=FONT,
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#E8F5E9', edgecolor='#A5D6A7', lw=0.8))

    # ── LEGEND ──
    leg_x, leg_y = 0.04, 0.04
    rounded_box(ax, leg_x, leg_y, 0.38, 0.10, '#37474F', '#263238', lw=1.5, zorder=3)
    ax.text(leg_x + 0.19, leg_y + 0.08, 'Legend', ha='center', va='top',
            fontsize=9, fontweight='bold', color='white', fontfamily=FONT, zorder=4)
    for i, (color, label) in enumerate([
        ('#1565C0', 'Primary table header'),
        ('#BBDEFB', 'PK — Primary Key'),
        ('#FFF3E0', 'FK — Foreign Key'),
    ]):
        bx = leg_x + 0.01 + i * 0.125
        rounded_box(ax, bx, leg_y + 0.015, 0.018, 0.025, color, '#90CAF9', lw=0.8, zorder=4)
        ax.text(bx + 0.022, leg_y + 0.028, label, ha='left', va='center',
                fontsize=8, color='white', fontfamily=FONT, zorder=5)

    source_note(ax)
    fig.savefig(f"{OUT}/fig07-erd.png", dpi=DPI, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close(fig)
    print("✓ fig07-erd.png")


# ─────────────────────────────────────────────────────────────────
# FIG 10 — THREE-TIER ARCHITECTURE
# ─────────────────────────────────────────────────────────────────
def make_three_tier():
    fig, ax = plt.subplots(figsize=(14, 9))
    fig.patch.set_facecolor('white')
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.965, "Figure 10 — Three-Tier System Architecture",
            ha='center', va='top', fontsize=14, fontweight='bold',
            color='#1A237E', fontfamily=FONT)
    ax.text(0.5, 0.935, "Masa Furniture Store · React 18 · Node.js / Express.js · SQLite 3",
            ha='center', va='top', fontsize=10, color='#3949AB', fontfamily=FONT)

    # ── PRESENTATION TIER ──
    rounded_box(ax, 0.03, 0.75, 0.94, 0.145, '#E3F2FD', '#1565C0', lw=2.5, zorder=2)
    ax.text(0.05, 0.884, "PRESENTATION TIER", fontsize=9, fontweight='bold',
            color='#0D47A1', fontfamily=FONT, va='top')
    # Browser icon (rectangle)
    rounded_box(ax, 0.055, 0.76, 0.08, 0.07, '#1565C0', '#0D47A1', lw=1.5, zorder=3)
    ax.text(0.095, 0.795, "WEB", ha="center", va="center", fontsize=9, fontweight="bold", color="white", fontfamily=FONT, zorder=4)
    ax.text(0.16, 0.816, "React 18 SPA — Web Browser", fontsize=11, fontweight='bold',
            color='#0D47A1', fontfamily=FONT, va='center')
    ax.text(0.16, 0.787, "Bootstrap 5 · React Router v6 · Axios · Context API (Cart / Auth / Wishlist)",
            fontsize=9, color='#1565C0', fontfamily=FONT, va='center')
    # URL badge
    rounded_box(ax, 0.62, 0.779, 0.32, 0.034, '#1565C0', '#0D47A1', lw=1.2,
                radius=0.02, zorder=3)
    ax.text(0.78, 0.796, "https://masa-furniture-1.onrender.com",
            ha='center', va='center', fontsize=8.5, color='white',
            fontweight='bold', fontfamily=FONT, zorder=4)

    # HTTPS arrow
    ax.annotate('', xy=(0.5, 0.748), xytext=(0.5, 0.75),
        arrowprops=dict(arrowstyle='<->', color='#D32F2F', lw=2.5), zorder=5)
    ax.text(0.52, 0.748, "HTTPS / TLS 1.3 · AES-256-GCM", fontsize=8.5,
            color='#B71C1C', fontweight='bold', fontfamily=FONT, va='top')

    # JWT arrow
    ax.annotate('', xy=(0.72, 0.748), xytext=(0.72, 0.75),
        arrowprops=dict(arrowstyle='<->', color='#6A1B9A', lw=2), zorder=5)
    ax.text(0.74, 0.748, "JWT Bearer", fontsize=8, color='#6A1B9A',
            fontweight='bold', fontfamily=FONT, va='top')

    # ── APPLICATION TIER ──
    rounded_box(ax, 0.03, 0.41, 0.94, 0.32, '#E0F2F1', '#00695C', lw=2.5, zorder=2)
    ax.text(0.05, 0.722, "APPLICATION TIER", fontsize=9, fontweight='bold',
            color='#004D40', fontfamily=FONT, va='top')
    # Server icon
    rounded_box(ax, 0.055, 0.54, 0.08, 0.12, '#00695C', '#004D40', lw=1.5, zorder=3)
    ax.text(0.095, 0.60, "SRV", ha="center", va="center", fontsize=9, fontweight="bold", color="white", fontfamily=FONT, zorder=4)
    ax.text(0.16, 0.625, "Node.js 20 LTS · Express.js 4.x",
            fontsize=10, fontweight='bold', color='#004D40', fontfamily=FONT, va='center')
    ax.text(0.16, 0.598, "https://masa-furniture.onrender.com",
            fontsize=8.5, color='#00695C', fontfamily=FONT, va='center')
    ax.text(0.16, 0.573, "JWT verifyToken · verifyAdmin middleware · Nodemailer SMTP",
            fontsize=8.5, color='#00695C', fontfamily=FONT, va='center')

    # Sub-component boxes
    components = [
        (0.055, 0.425, '#00897B', '#004D40', 'Express Router', '/api/products · /api/orders\n/api/auth · /api/wishlist'),
        (0.245, 0.425, '#00897B', '#004D40', 'JWT Auth', 'verifyToken\nverifyAdmin'),
        (0.405, 0.425, '#D32F2F', '#B71C1C', 'Security Layer', 'Price recalculation\nPrepared statements'),
        (0.565, 0.425, '#6A1B9A', '#4A148C', 'Stripe SDK', 'PaymentIntent\nWebhook verify'),
        (0.725, 0.425, '#00897B', '#004D40', 'Email', 'Nodemailer\nSMTP confirm'),
        (0.840, 0.425, '#37474F', '#263238', 'CI/CD', 'GitHub Actions\nJest 107 tests'),
    ]
    for cx, cy, fill, ec, title, body in components:
        rounded_box(ax, cx, cy, 0.145, 0.10, fill, ec, lw=1.5, zorder=3)
        ax.text(cx + 0.0725, cy + 0.072, title, ha='center', va='top',
                fontsize=8.5, fontweight='bold', color='white', fontfamily=FONT, zorder=4)
        for j, line in enumerate(body.split('\n')):
            ax.text(cx + 0.0725, cy + 0.048 - j*0.022, line, ha='center', va='top',
                    fontsize=7.5, color='#E0E0E0', fontfamily=FONT, zorder=4)

    # SQL arrow
    ax.annotate('', xy=(0.32, 0.408), xytext=(0.32, 0.424),
        arrowprops=dict(arrowstyle='<->', color='#E65100', lw=2.2), zorder=5)
    ax.text(0.34, 0.408, "SQL — prepared stmts", fontsize=8, color='#BF360C',
            fontweight='bold', fontfamily=FONT, va='top')

    # Stripe arrow
    ax.annotate('', xy=(0.72, 0.408), xytext=(0.72, 0.424),
        arrowprops=dict(arrowstyle='<->', color='#6A1B9A', lw=2), zorder=5)
    ax.text(0.73, 0.408, "HTTPS", fontsize=8, color='#4A148C',
            fontweight='bold', fontfamily=FONT, va='top')

    # ── DATA TIER ──
    rounded_box(ax, 0.03, 0.18, 0.55, 0.20, '#FFF8E1', '#F57F17', lw=2.5, zorder=2)
    ax.text(0.05, 0.372, "DATA TIER", fontsize=9, fontweight='bold',
            color='#E65100', fontfamily=FONT, va='top')
    rounded_box(ax, 0.06, 0.20, 0.08, 0.12, '#E65100', '#BF360C', lw=1.5, zorder=3)
    ax.text(0.10, 0.26, "DB", ha="center", va="center", fontsize=9, fontweight="bold", color="white", fontfamily=FONT, zorder=4)
    ax.text(0.165, 0.305, "SQLite 3 — masa.db", fontsize=10, fontweight='bold',
            color='#BF360C', fontfamily=FONT, va='center')
    ax.text(0.165, 0.278, "Tables: users · products · orders · order_items",
            fontsize=9, color='#E65100', fontfamily=FONT, va='center')
    ax.text(0.165, 0.253, "PRAGMA foreign_keys = ON · db.transaction() · better-sqlite3",
            fontsize=9, color='#E65100', fontfamily=FONT, va='center')
    ax.text(0.165, 0.228, "bcrypt 12 rounds · price snapshot immutable at order time",
            fontsize=9, color='#E65100', fontfamily=FONT, va='center')

    # ── EXTERNAL — STRIPE ──
    rounded_box(ax, 0.61, 0.18, 0.36, 0.20, '#F3E5F5', '#6A1B9A', lw=2.5, zorder=2)
    ax.text(0.63, 0.372, "EXTERNAL — STRIPE", fontsize=9, fontweight='bold',
            color='#4A148C', fontfamily=FONT, va='top')
    rounded_box(ax, 0.63, 0.20, 0.07, 0.10, '#6A1B9A', '#4A148C', lw=1.5, zorder=3)
    ax.text(0.665, 0.25, "PAY", ha="center", va="center", fontsize=8, fontweight="bold", color="white", fontfamily=FONT, zorder=4)
    ax.text(0.72, 0.305, "Stripe API — Test Mode", fontsize=10, fontweight='bold',
            color='#4A148C', fontfamily=FONT, va='center')
    ax.text(0.72, 0.278, "PCI DSS Level 1 · 256-bit TLS · PaymentIntent",
            fontsize=9, color='#6A1B9A', fontfamily=FONT, va='center')
    ax.text(0.72, 0.253, "Card: 4242 4242 4242 4242 · Webhook verify",
            fontsize=9, color='#6A1B9A', fontfamily=FONT, va='center')

    source_note(ax)
    fig.savefig(f"{OUT}/fig10-three-tier.png", dpi=DPI, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close(fig)
    print("✓ fig10-three-tier.png")


# ─────────────────────────────────────────────────────────────────
# FIG 11 — SECURITY ARCHITECTURE
# ─────────────────────────────────────────────────────────────────
def make_security():
    fig, ax = plt.subplots(figsize=(13, 10))
    fig.patch.set_facecolor('white')
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.968, "Figure 11 — Security Architecture",
            ha='center', va='top', fontsize=14, fontweight='bold',
            color='#1A237E', fontfamily=FONT)
    ax.text(0.5, 0.938, "Masa Furniture Store · Defence-in-Depth Model",
            ha='center', va='top', fontsize=10, color='#3949AB', fontfamily=FONT)

    # Layer 1 — Transport (outermost, red)
    rounded_box(ax, 0.03, 0.05, 0.94, 0.86, '#FFEBEE', '#C62828', lw=3, zorder=1)
    ax.text(0.05, 0.90, "LAYER 1 — TRANSPORT SECURITY", fontsize=10,
            fontweight='bold', color='#C62828', fontfamily=FONT, va='top')
    rounded_box(ax, 0.055, 0.785, 0.89, 0.08, '#FFCDD2', '#C62828', lw=1.5, zorder=3)
    ax.text(0.065, 0.825, "🔒", fontsize=18, va='center')
    ax.text(0.14, 0.838, "TLS 1.3 — AES-256-GCM Encryption", fontsize=10,
            fontweight='bold', color='#B71C1C', fontfamily=FONT, va='center')
    ax.text(0.14, 0.808, "All traffic encrypted between browser and server · "
            "HTTPS enforced in production · Stripe PCI DSS Level 1",
            fontsize=8.5, color='#C62828', fontfamily=FONT, va='center')

    # Layer 2 — Session Security (orange)
    rounded_box(ax, 0.055, 0.06, 0.89, 0.70, '#FFF8E1', '#F57F17', lw=2.5, zorder=2)
    ax.text(0.075, 0.755, "LAYER 2 — SESSION SECURITY", fontsize=10,
            fontweight='bold', color='#E65100', fontfamily=FONT, va='top')
    rounded_box(ax, 0.08, 0.650, 0.86, 0.08, '#FFF3E0', '#F57F17', lw=1.5, zorder=3)
    ax.text(0.09, 0.690, "🔑", fontsize=18, va='center')
    ax.text(0.165, 0.703, "JWT Authentication — HS256 · 7-day expiry · httpOnly cookies",
            fontsize=10, fontweight='bold', color='#E65100', fontfamily=FONT, va='center')
    ax.text(0.165, 0.673, "verifyToken middleware on all protected routes · "
            "verifyAdmin on /api/admin/* · plain-text passwords never stored",
            fontsize=8.5, color='#BF360C', fontfamily=FONT, va='center')

    # Layer 3 — Application Security (green)
    rounded_box(ax, 0.08, 0.07, 0.84, 0.56, '#E8F5E9', '#2E7D32', lw=2.5, zorder=2)
    ax.text(0.10, 0.624, "LAYER 3 — APPLICATION SECURITY", fontsize=10,
            fontweight='bold', color='#1B5E20', fontfamily=FONT, va='top')

    # Price recalculation
    rounded_box(ax, 0.10, 0.510, 0.80, 0.085, '#C8E6C9', '#2E7D32', lw=1.5, zorder=3)
    ax.text(0.115, 0.552, "💰", fontsize=18, va='center')
    ax.text(0.19, 0.565, "Server-Side Price Recalculation (OWASP A04)",
            fontsize=10, fontweight='bold', color='#1B5E20', fontfamily=FONT, va='center')
    ax.text(0.19, 0.535, "Price fetched from DB at checkout · "
            "Client-submitted value discarded · unit_price stored as immutable snapshot",
            fontsize=8.5, color='#2E7D32', fontfamily=FONT, va='center')

    # SQL injection
    rounded_box(ax, 0.10, 0.410, 0.80, 0.085, '#BBDEFB', '#1565C0', lw=1.5, zorder=3)
    ax.text(0.115, 0.452, "🛡️", fontsize=18, va='center')
    ax.text(0.19, 0.465, "SQL Injection Prevention — Prepared Statements",
            fontsize=10, fontweight='bold', color='#0D47A1', fontfamily=FONT, va='center')
    ax.text(0.19, 0.435, "All DB queries use ? placeholders via better-sqlite3 · "
            "Zero string interpolation in SQL",
            fontsize=8.5, color='#1565C0', fontfamily=FONT, va='center')

    # Bcrypt
    rounded_box(ax, 0.10, 0.310, 0.80, 0.085, '#E1BEE7', '#6A1B9A', lw=1.5, zorder=3)
    ax.text(0.115, 0.352, "🔐", fontsize=18, va='center')
    ax.text(0.19, 0.365, "Password Hashing — bcrypt 12 salt rounds",
            fontsize=10, fontweight='bold', color='#4A148C', fontfamily=FONT, va='center')
    ax.text(0.19, 0.335, "Hash-only storage · Plain-text passwords never written to DB · "
            "Timing-safe comparison",
            fontsize=8.5, color='#6A1B9A', fontfamily=FONT, va='center')

    # Layer 4 — Data Integrity (purple, innermost)
    rounded_box(ax, 0.10, 0.08, 0.80, 0.21, '#EDE7F6', '#6A1B9A', lw=2.5, zorder=2)
    ax.text(0.12, 0.285, "LAYER 4 — DATA INTEGRITY", fontsize=10,
            fontweight='bold', color='#4A148C', fontfamily=FONT, va='top')

    # Atomic transactions
    rounded_box(ax, 0.115, 0.185, 0.77, 0.075, '#D1C4E9', '#6A1B9A', lw=1.5, zorder=3)
    ax.text(0.13, 0.222, "⚡", fontsize=16, va='center')
    ax.text(0.195, 0.233, "Atomic Transactions — db.transaction()",
            fontsize=10, fontweight='bold', color='#4A148C', fontfamily=FONT, va='center')
    ax.text(0.195, 0.207, "orders + order_items inserted in one atomic unit · "
            "Auto-rollback on any failure · No orphaned records",
            fontsize=8.5, color='#6A1B9A', fontfamily=FONT, va='center')

    # FK integrity
    rounded_box(ax, 0.115, 0.095, 0.77, 0.075, '#ECEFF1', '#455A64', lw=1.5, zorder=3)
    ax.text(0.13, 0.132, "🗄️", fontsize=16, va='center')
    ax.text(0.195, 0.143, "SQLite 3 — PRAGMA foreign_keys = ON",
            fontsize=10, fontweight='bold', color='#37474F', fontfamily=FONT, va='center')
    ax.text(0.195, 0.117, "Referential integrity enforced at DB level · "
            "Cascade behaviour · Orphan prevention",
            fontsize=8.5, color='#455A64', fontfamily=FONT, va='center')

    source_note(ax)
    fig.savefig(f"{OUT}/fig11-security.png", dpi=DPI, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close(fig)
    print("✓ fig11-security.png")


# ─────────────────────────────────────────────────────────────────
# FIG 14 — RESPONSIVE BREAKPOINTS
# ─────────────────────────────────────────────────────────────────
def make_responsive():
    fig, ax = plt.subplots(figsize=(15, 10))
    fig.patch.set_facecolor('white')
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.97, "Figure 14 — Responsive Breakpoint Layout",
            ha='center', va='top', fontsize=14, fontweight='bold',
            color='#1A237E', fontfamily=FONT)
    ax.text(0.5, 0.94, "Masa Furniture Store · Bootstrap 5 · Three Viewport Tiers",
            ha='center', va='top', fontsize=10, color='#3949AB', fontfamily=FONT)

    cols = [
        (0.02, 0.30, '#1565C0', '#0D47A1', 'MOBILE', '375 px — col-12'),
        (0.35, 0.30, '#00695C', '#004D40', 'TABLET', '768 px — col-sm-6'),
        (0.68, 0.30, '#E65100', '#BF360C', 'DESKTOP', '1280 px — col-md-4'),
    ]
    for cx, cw, fill, ec, title, sub in cols:
        header_box(ax, cx, 0.88, cw, 0.048, fill, ec, title, tc='white', fs=12, lw=2)
        ax.text(cx + cw/2, 0.872, sub, ha='center', va='top', fontsize=9,
                style='italic', color=fill, fontfamily=FONT)

    rows = [
        ('NAVBAR', [
            ('Hamburger Menu\n• Logo only · Cart badge\n• Links in off-canvas drawer', '#E3F2FD', '#1565C0'),
            ('Partial Expand\n• Logo + 3 primary links\n• Search bar visible', '#E0F2F1', '#00695C'),
            ('Full Navigation\n• All links · Category dropdown\n• Search + Cart + Admin link', '#FBE9E7', '#E65100'),
        ]),
        ('CATALOGUE', [
            ('Single Column — col-12\n• 1 card per row (full width)\n• Filter stacked above grid', '#E3F2FD', '#1565C0'),
            ('Two Columns — col-sm-6\n• 2 cards per row\n• Sort controls inline', '#E0F2F1', '#00695C'),
            ('Three Columns — col-md-4\n• 3 cards per row\n• Sidebar: category + price filter', '#FBE9E7', '#E65100'),
        ]),
        ('PRODUCT\nDETAIL', [
            ('Stacked Layout\n• Full-width image on top\n• Add to Cart full width', '#E3F2FD', '#1565C0'),
            ('Side-by-Side\n• Image 50% · Info right\n• Stock badge · Qty selector', '#E0F2F1', '#00695C'),
            ('Full Side-by-Side\n• Large image · Detailed info\n• Related products row', '#FBE9E7', '#E65100'),
        ]),
        ('CART', [
            ('Stacked Rows\n• Qty & price separate lines\n• Remove full width', '#E3F2FD', '#1565C0'),
            ('Compact Table\n• All columns in one row\n• Horizontal scroll overflow', '#E0F2F1', '#00695C'),
            ('Full Data Table\n• Image · Name · Qty · Price\n• Editable qty · Checkout CTA', '#FBE9E7', '#E65100'),
        ]),
        ('CHECKOUT', [
            ('Single Column Form\n• Vertical stacking\n• Stripe Elements full width', '#E3F2FD', '#1565C0'),
            ('Two-Column Layout\n• Form left · Summary right\n• Place Order full width', '#E0F2F1', '#00695C'),
            ('Full Side-by-Side\n• Stripe Elements + Summary\n• Itemised order · Server total', '#FBE9E7', '#E65100'),
        ]),
    ]

    row_h = 0.124
    row_start = 0.83
    for ri, (label, cells) in enumerate(rows):
        ry = row_start - (ri+1) * row_h
        ax.text(0.005, ry + row_h/2, label, ha='left', va='center',
                fontsize=8, fontweight='bold', color='#546E7A', fontfamily=FONT)
        for ci, ((cx, cw, _, _, _, _), (text, fill, ec)) in enumerate(zip(cols, cells)):
            rounded_box(ax, cx, ry + 0.005, cw, row_h - 0.01, fill, ec, lw=1, zorder=3)
            for li, line in enumerate(text.split('\n')):
                fs = 9 if li == 0 else 8
                fw = 'bold' if li == 0 else 'normal'
                ax.text(cx + cw/2, ry + row_h/2 + (1-li)*0.022, line,
                        ha='center', va='center', fontsize=fs, fontweight=fw,
                        color='#212121', fontfamily=FONT, zorder=4)

    # Breakpoint arrows
    ax.annotate('', xy=(0.347, 0.53), xytext=(0.325, 0.53),
        arrowprops=dict(arrowstyle='->', color='#37474F', lw=2.5), zorder=5)
    ax.text(0.336, 0.545, 'sm ≥576px', ha='center', fontsize=8,
            fontweight='bold', color='#37474F', fontfamily=FONT)
    ax.annotate('', xy=(0.678, 0.53), xytext=(0.656, 0.53),
        arrowprops=dict(arrowstyle='->', color='#37474F', lw=2.5), zorder=5)
    ax.text(0.667, 0.545, 'md ≥768px', ha='center', fontsize=8,
            fontweight='bold', color='#37474F', fontfamily=FONT)

    source_note(ax)
    fig.savefig(f"{OUT}/fig14-responsive.png", dpi=DPI, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close(fig)
    print("✓ fig14-responsive.png")


# ─────────────────────────────────────────────────────────────────
# FIG 6 — PAYMENT FLOW SEQUENCE
# ─────────────────────────────────────────────────────────────────
def make_payment_flow():
    fig, ax = plt.subplots(figsize=(14, 10))
    fig.patch.set_facecolor('white')
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.97, "Figure 6 — Payment Flow Sequence Diagram",
            ha='center', va='top', fontsize=14, fontweight='bold',
            color='#1A237E', fontfamily=FONT)
    ax.text(0.5, 0.94, "Masa Furniture Store · Stripe PaymentIntent · Server-Side Price Integrity",
            ha='center', va='top', fontsize=10, color='#3949AB', fontfamily=FONT)

    actors = [
        (0.12, 'Browser\n(Client)',    '#1565C0', '#0D47A1'),
        (0.38, 'Express Server',       '#2E7D32', '#1B5E20'),
        (0.62, 'SQLite DB',            '#E65100', '#BF360C'),
        (0.88, 'Stripe API',           '#6A1B9A', '#4A148C'),
    ]
    # Actor boxes
    for ax_x, label, fill, ec in actors:
        rounded_box(ax, ax_x - 0.09, 0.875, 0.18, 0.06,
                    fill, ec, lw=2, zorder=3, radius=0.015)
        ax.text(ax_x, 0.905, label, ha='center', va='center',
                fontsize=9.5, fontweight='bold', color='white', fontfamily=FONT, zorder=4)

    # Lifelines
    for ax_x, *_ in actors:
        ax.plot([ax_x, ax_x], [0.875, 0.055], color='#B0BEC5', lw=1.2,
                linestyle='--', zorder=1)

    messages = [
        # (y, from_x, to_x, label, color, note)
        (0.840, 0.12, 0.38, "1. POST /api/orders/create-payment-intent", '#1565C0', None),
        (0.800, 0.38, 0.62, "2. SELECT price FROM products WHERE id = ?", '#E65100', None),
        (0.760, 0.62, 0.38, "3. Return canonical prices (server-authoritative)", '#E65100',
         "Client-submitted prices DISCARDED\nTotal recalculated server-side"),
        (0.710, 0.38, 0.88, "4. Create PaymentIntent (amount = server total)", '#6A1B9A', None),
        (0.670, 0.88, 0.38, "5. Return { clientSecret }", '#6A1B9A', None),
        (0.630, 0.38, 0.12, "6. Return clientSecret to browser", '#1565C0', None),
        (0.575, 0.12, 0.88, "7. Card details → Stripe directly (PCI DSS)", '#6A1B9A',
         "Card data NEVER passes through\napplication server"),
        (0.525, 0.88, 0.12, "8. Payment confirmed (client-side)", '#6A1B9A', None),
        (0.485, 0.88, 0.38, "9. Webhook: payment_intent.succeeded", '#6A1B9A', None),
        (0.445, 0.38, 0.62, "10. BEGIN TRANSACTION — INSERT orders + order_items", '#E65100', None),
        (0.405, 0.62, 0.38, "11. COMMIT — order_id returned", '#E65100',
         "Atomic insert — auto-rollback on failure"),
        (0.355, 0.38, 0.12, "12. HTTP 200 — order confirmed", '#1565C0', None),
    ]

    for y, fx, tx, label, color, note in messages:
        direction = 1 if tx > fx else -1
        ax.annotate('', xy=(tx, y), xytext=(fx, y),
            arrowprops=dict(arrowstyle='->', color=color, lw=1.8), zorder=4)
        mx = (fx + tx) / 2
        ax.text(mx, y + 0.012, label, ha='center', va='bottom',
                fontsize=8, color=color, fontfamily=FONT, zorder=5)
        if note:
            rounded_box(ax, fx + (tx-fx)*0.3, y - 0.048, abs(tx-fx)*0.55, 0.038,
                        '#FFF9C4', '#F9A825', lw=1, zorder=3)
            for ni, nl in enumerate(note.split('\n')):
                ax.text(fx + (tx-fx)*0.575, y - 0.025 - ni*0.016, nl,
                        ha='center', va='center', fontsize=7.5,
                        color='#5D4037', fontfamily=FONT, zorder=4)

    source_note(ax)
    fig.savefig(f"{OUT}/fig06-payment-flow.png", dpi=DPI, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close(fig)
    print("✓ fig06-payment-flow.png")


# ─────────────────────────────────────────────────────────────────
# FIG 13 — TEST ARCHITECTURE
# ─────────────────────────────────────────────────────────────────
def make_test_arch():
    fig, ax = plt.subplots(figsize=(13, 8))
    fig.patch.set_facecolor('white')
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.axis('off')

    ax.text(0.5, 0.97, "Figure 13 — Test Architecture",
            ha='center', va='top', fontsize=14, fontweight='bold',
            color='#1A237E', fontfamily=FONT)
    ax.text(0.5, 0.94, "Masa Furniture Store · Jest 29 · Supertest · React Testing Library",
            ha='center', va='top', fontsize=10, color='#3949AB', fontfamily=FONT)

    # Server tests
    rounded_box(ax, 0.03, 0.50, 0.44, 0.42, '#E3F2FD', '#1565C0', lw=2.5, zorder=2)
    ax.text(0.25, 0.915, "SERVER TESTS — 107 / 107 Passing", ha='center', va='top',
            fontsize=10, fontweight='bold', color='#0D47A1', fontfamily=FONT)
    server_tests = [
        ('auth.test.js', '14 tests', 'Register · Login · JWT · 401'),
        ('products.test.js', '18 tests', 'GET filters · 404 · sort'),
        ('orders.test.js', '16 tests', 'Price recalc · atomic insert'),
        ('admin.test.js', '20 tests', '403 non-admin · CRUD · status'),
        ('cart.test.js', '12 tests', 'Context · localStorage · bounds'),
        ('wishlist.test.js', '8 tests', 'Add · Remove · List per user'),
        ('shipping.test.js', '7 tests', 'Rate calc · admin settings'),
        ('email.test.js', '6 tests', 'Nodemailer mock: order+contact'),
        ('middleware.test.js', '6 tests', 'verifyToken · verifyAdmin edge'),
    ]
    for i, (name, count, desc) in enumerate(server_tests):
        ry = 0.87 - i * 0.042
        if ry < 0.50: break
        rounded_box(ax, 0.04, ry - 0.035, 0.42, 0.038,
                    '#E3F2FD' if i%2==0 else 'white', '#90CAF9', lw=0.5, zorder=3)
        ax.text(0.055, ry - 0.016, name, va='center', fontsize=8.5,
                fontweight='bold', color='#1565C0', fontfamily=FONT, zorder=4)
        ax.text(0.245, ry - 0.016, count, va='center', fontsize=8.5,
                color='#2E7D32', fontfamily=FONT, zorder=4)
        ax.text(0.305, ry - 0.016, desc, va='center', fontsize=8,
                color='#455A64', fontfamily=FONT, zorder=4)

    # Client tests
    rounded_box(ax, 0.03, 0.05, 0.44, 0.42, '#E8F5E9', '#2E7D32', lw=2.5, zorder=2)
    ax.text(0.25, 0.465, "CLIENT TESTS — 94 / 96 Passing", ha='center', va='top',
            fontsize=10, fontweight='bold', color='#1B5E20', fontfamily=FONT)
    client_tests = [
        ('HomePage.test.jsx', '8 tests', 'Hero · search · categories'),
        ('ShopPage.test.jsx', '10 tests', 'Filter · sort · grid toggle'),
        ('ProductDetail.test.jsx', '9 tests', 'Gallery · cart · reviews'),
        ('Cart.test.jsx', '8 tests', 'Qty · coupon · progress bar'),
        ('Checkout.test.jsx', '10 tests', '3-step wizard · Stripe mock'),
        ('Auth.test.jsx', '12 tests', 'Register · Login · JWT'),
        ('Dashboard.test.jsx', '9 tests', 'Orders · wishlist · profile'),
        ('Admin.test.jsx', '10 tests', 'CRUD · status · 403 guard'),
        ('context tests', '18 tests', 'Cart/Auth/Wishlist context'),
    ]
    for i, (name, count, desc) in enumerate(client_tests):
        ry = 0.425 - i * 0.042
        if ry < 0.055: break
        rounded_box(ax, 0.04, ry - 0.035, 0.42, 0.038,
                    '#E8F5E9' if i%2==0 else 'white', '#A5D6A7', lw=0.5, zorder=3)
        ax.text(0.055, ry - 0.016, name, va='center', fontsize=8.5,
                fontweight='bold', color='#2E7D32', fontfamily=FONT, zorder=4)
        ax.text(0.245, ry - 0.016, count, va='center', fontsize=8.5,
                color='#1565C0', fontfamily=FONT, zorder=4)
        ax.text(0.305, ry - 0.016, desc, va='center', fontsize=8,
                color='#455A64', fontfamily=FONT, zorder=4)

    # Toolchain
    rounded_box(ax, 0.52, 0.50, 0.46, 0.42, '#FFF8E1', '#F57F17', lw=2.5, zorder=2)
    ax.text(0.75, 0.915, "TOOLCHAIN", ha='center', va='top',
            fontsize=10, fontweight='bold', color='#E65100', fontfamily=FONT)
    tools = [
        ('[T]', 'Jest 29', 'Test runner · Assertions · Mocking · Coverage'),
        ('[H]', 'Supertest', 'HTTP simulation · Express route testing'),
        ('[R]', 'React Testing Library', 'Component render · User event sim'),
        ('[DB]', 'SQLite in-memory DB', 'Isolated per suite · No state pollution'),
        ('[C]', 'Istanbul / c8', 'Line · Branch · Function coverage'),
    ]
    for i, (icon, name, desc) in enumerate(tools):
        ry = 0.87 - i * 0.078
        rounded_box(ax, 0.53, ry - 0.065, 0.44, 0.070,
                    '#FFF3E0', '#FFB300', lw=1, zorder=3)
        ax.text(0.55, ry - 0.028, icon, fontsize=16, va='center', zorder=4)
        ax.text(0.59, ry - 0.022, name, va='center', fontsize=9.5,
                fontweight='bold', color='#E65100', fontfamily=FONT, zorder=4)
        ax.text(0.59, ry - 0.046, desc, va='center', fontsize=8.5,
                color='#5D4037', fontfamily=FONT, zorder=4)

    # Coverage summary box
    rounded_box(ax, 0.52, 0.05, 0.46, 0.41, '#EDE7F6', '#6A1B9A', lw=2.5, zorder=2)
    ax.text(0.75, 0.455, "COVERAGE SUMMARY", ha='center', va='top',
            fontsize=10, fontweight='bold', color='#4A148C', fontfamily=FONT)
    coverage = [
        ('Server', '107', '9 suites', 'auth · products · orders · admin\ncart · wishlist · shipping · email · middleware'),
        ('Client', '94', '12 files', 'pages · context · components'),
    ]
    for i, (tier, count, suites, detail) in enumerate(coverage):
        bx = 0.535 + i * 0.225
        rounded_box(ax, bx, 0.08, 0.21, 0.34, '#F3E5F5', '#CE93D8', lw=1.5, zorder=3)
        ax.text(bx + 0.105, 0.400, tier, ha='center', va='top', fontsize=11,
                fontweight='bold', color='#4A148C', fontfamily=FONT, zorder=4)
        ax.text(bx + 0.105, 0.360, count, ha='center', va='top', fontsize=26,
                fontweight='bold', color='#2E7D32', fontfamily=FONT, zorder=4)
        ax.text(bx + 0.105, 0.300, 'tests passing', ha='center', va='top', fontsize=9,
                color='#455A64', fontfamily=FONT, zorder=4)
        ax.text(bx + 0.105, 0.268, suites, ha='center', va='top', fontsize=8.5,
                fontweight='bold', color='#6A1B9A', fontfamily=FONT, zorder=4)
        for li, dl in enumerate(detail.split('\n')):
            ax.text(bx + 0.105, 0.240 - li*0.022, dl, ha='center', va='top',
                    fontsize=7.5, color='#455A64', fontfamily=FONT, zorder=4)

    # Arrows from test boxes to toolchain
    ax.annotate('', xy=(0.515, 0.70), xytext=(0.47, 0.70),
        arrowprops=dict(arrowstyle='->', color='#F57F17', lw=2), zorder=5)
    ax.annotate('', xy=(0.515, 0.26), xytext=(0.47, 0.26),
        arrowprops=dict(arrowstyle='->', color='#F57F17', lw=2), zorder=5)

    source_note(ax)
    fig.savefig(f"{OUT}/fig13-test-arch.png", dpi=DPI, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close(fig)
    print("✓ fig13-test-arch.png")


if __name__ == '__main__':
    print("Generating diagrams...")
    make_erd()
    make_three_tier()
    make_security()
    make_responsive()
    make_payment_flow()
    make_test_arch()
    print("\nAll done →", OUT)
