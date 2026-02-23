import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

// --- Types ---
interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  video?: string;
  image?: string;
}

// --- Data ---
const COMMERCIAL_DATA: ProjectItem[] = [
  {
    id: 'exp',
    title: '华为智能组串式储能系统官网素材',
    subtitle: 'Digital Energy System，2024',
    description: '负责 LUNA2000 S1 系列全场景的三维视觉构建',
    tags: ['Energy', '3D Architecture'],
    video: 'https://solar.huawei.com/admin/asset/v1/pro/view/330af497446a4a59bba4c0594148980a.mp4'
  },
  {
    id: 'del',
    title: 'ZERO 设计体系',
    subtitle: 'ZERO Design System',
    description: '数字孪生的设计规则，涵盖整个数字能源相应业态的场景，L1-L3级分层，转换语义抽象和字意抽象',
    tags: ['Rendering', 'Animation'],
    image: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/03-Rendering/01ZERO%20Design%20System.png'
  },
  {
    id: 'std',
    title: '其它华为能源官网三维素材',
    subtitle: 'Huawei Digital Power 3D Resources，2023-2025',
    description: '仅展示我参与制作部分',
    tags: ['System Design', 'Guidelines'],
    video: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.1首页使用.mp4'
  },
  {
    id: 'log',
    title: '矶物-JIWU 银箔大理石茶几系列  ',
    subtitle: 'JIWU Collection 2025',
    description: '前公司邀请制作2025款银箔大理石茶几产品视频',
    tags: ['Technical Art', 'NPR'],
    video: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/04/01banner.mp4'
  },
  {
    id: 'vis',
    title: 'HELIAN型材灯具',
    subtitle: 'HELIAN 2022',
    description: 'HELIAN型材灯具，创作于2022年',
    tags: ['3D', 'Motion'],
    video: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/05/01banner.mp4'
  }
];

// --- Works Data ---
interface WorkItem {
    file: string;
    name: string;
    type: 'video' | 'gif';
    origW: number;  // source pixel width (for aspect ratio)
    origH: number;  // source pixel height
    cardW?: number; // display card width (default 480); landscape gets 960
}

const WORKS_DATA: WorkItem[] = [
    { file: 'case-yoyo.mp4',         name: 'case',          type: 'video', origW: 1500, origH: 1500, cardW: 960  }, // 0
    { file: 'MRI-.mp4',              name: 'MRI',           type: 'video', origW: 720,  origH: 1280             }, // 1
    { file: '苹果.mp4',              name: '苹果',           type: 'video', origW: 720,  origH: 1280             }, // 2
    { file: '方块-1.mp4',            name: '方块-1',         type: 'video', origW: 720,  origH: 1280             }, // 3
    { file: '球-2部分.mp4',          name: '球-2',           type: 'video', origW: 1080, origH: 1080, cardW: 960  }, // 4
    { file: '球-4部分.mp4',          name: '球-4',           type: 'video', origW: 720,  origH: 1280             }, // 5
    { file: '水晶.gif',               name: '水晶',           type: 'gif',   origW: 1600, origH: 900,  cardW: 960  }, // 6
    { file: '大人糖-1.mp4',          name: '大人糖-1',        type: 'video', origW: 828,  origH: 1106, cardW: 720  }, // 7
    { file: '大人糖-2.mp4',          name: '大人糖-2',        type: 'video', origW: 1920, origH: 1080, cardW: 960  }, // 8
    { file: '气球-1部分.gif',         name: '气球-1',         type: 'gif',   origW: 1080, origH: 1350, cardW: 768  }, // 9
    { file: '型材1.mp4',             name: '型材1',           type: 'video', origW: 720,  origH: 900,  cardW: 768  }, // 10
    { file: '型材2.mp4',             name: '型材2',           type: 'video', origW: 720,  origH: 900,  cardW: 768  }, // 11
    { file: '家具系列-餐椅-1.mp4',   name: '家具系列-餐椅',   type: 'video', origW: 1494, origH: 1080, cardW: 960  }, // 12
    { file: '家具系列-沙发-1.mp4',   name: '家具系列-沙发',   type: 'video', origW: 1500, origH: 1500, cardW: 768  }, // 13
    { file: '家具系列-木凳-1.mp4',   name: '家具系列-木凳',   type: 'video', origW: 1500, origH: 1500, cardW: 768  }, // 14
    { file: '家具系列-置物架-2.mp4', name: '家具系列-置物架', type: 'video', origW: 1300, origH: 1300, cardW: 768  }, // 15
    { file: '家具系列-茶几-3.mp4',   name: '家具系列-茶几',   type: 'video', origW: 720,  origH: 900,  cardW: 768  }, // 16
    { file: '家具系列-灯-1.mp4',     name: '家具系列-灯',     type: 'video', origW: 1500, origH: 1500, cardW: 768  }, // 17
    { file: '家具系列-碗-4.mp4',     name: '家具系列-碗',     type: 'video', origW: 1200, origH: 1200, cardW: 768  }, // 18
];

// --- Utilities ---
const lerpColor = (c1: number[], c2: number[], t: number) => {
    return c1.map((start, i) => Math.round(start + (c2[i] - start) * t));
};

const rgbToHex = (rgb: number[]) => {
    return "#" + rgb.map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
};

const createLetterTexture = (char: string) => {
    const canvas = document.createElement('canvas');
    const width = 600;
    const height = 1024;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 12; // Extra thickness for +20% bolder
    ctx.font = '900 950px "Inter", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Condensed: compress horizontally
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(0.55, 1);
    ctx.strokeText(char, 0, 0); // Stroke for extra boldness
    ctx.fillText(char, 0, 0);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
};


// --- Components ---

/**
 * Smooth Cursor Follower
 */
const SmoothCursor: React.FC = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);
    
    const posRef = useRef({ x: -100, y: -100 });
    const mouseRef = useRef({ x: -100, y: -100 });
    const inNavRef = useRef(false); // 鼠标是否在导航栏范围内

    useEffect(() => {
        const updateMouse = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
            inNavRef.current = e.clientY < 78;
            if (window.scrollY <= window.innerHeight * 0.8) {
                setIsVisible(!inNavRef.current);
            }
        };

        const handleScroll = () => {
            if (window.scrollY > window.innerHeight * 0.8) {
                setIsVisible(false);
            } else {
                setIsVisible(!inNavRef.current);
            }
        };

        window.addEventListener('mousemove', updateMouse);
        window.addEventListener('scroll', handleScroll);
        
        const loop = () => {
            if (!cursorRef.current) return;
            const ease = 0.015;
            
            const dx = mouseRef.current.x - posRef.current.x;
            const dy = mouseRef.current.y - posRef.current.y;
            
            posRef.current.x += dx * ease;
            posRef.current.y += dy * ease;
            
            cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%)`;
            
            requestAnimationFrame(loop);
        };
        const rafId = requestAnimationFrame(loop);
        
        return () => {
            window.removeEventListener('mousemove', updateMouse);
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div 
            ref={cursorRef}
            className={`fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[9999] shadow-[0_0_15px_2px_rgba(255,255,255,0.9)] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ willChange: 'transform' }}
        />
    );
};

/**
 * Sphere Interaction (Grid Version)
 * Push particles when mouse moves nearby
 * Slowly return to position when mouse stops
 */
// ─── 圆球交互参数（在这里调整） ───────────────────────────────────────
// Reference viewport width: 4K (3840) @ 150% zoom = 2560 effective px
const BALL_REF_VW = 2560;

const BALL_CONFIG = {
    // 布局（参考尺寸，实际值随视口缩放）
    gap:            47,    // 网格间距 px @参考视口
    navHeight:      88,    // 导航栏高度 px（球区域顶部）
    // 底部边界由 MOTION DESIGNER 分割线高度动态计算，不再硬编码行数

    // 球外观（@参考视口 2560px，运行时按 vwScale 缩放）
    maxRadius:      25,
    anchorRadius:   5,
    lineWidth:      4,
    edgeShrink:     0.28,
    maxZoneRadius:  0,
    maxZoneHStretch: 2.0,

    // 椭圆最大球区域
    ellipseA:       0.37,  // 半长轴，占视口宽度比例（不缩放，已是百分比）
    ellipseB:       141,   // 半短轴 px @参考视口
    ellipseCY:      0.333,

    // 颜色渐变（RGB）
    colorTop:       [106, 188, 255] as [number, number, number],
    colorMid:       [26,  121, 197] as [number, number, number],
    colorBot:       [39,   39,  39] as [number, number, number],
    colorMidPoint:  0.45,

    // 物理
    returnSpeed:    0.012,
    mouseRadius:    180,
    pushForce:      5,
};
// ───────────────────────────────────────────────────────────────────────

const ElasticStruct: React.FC<{ className?: string }> = ({ className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const {
            gap: GAP_REF, navHeight,
            maxRadius: MAX_RADIUS_REF, anchorRadius: ANCHOR_RADIUS_REF, lineWidth: LINE_WIDTH_REF,
            edgeShrink, maxZoneRadius: MAX_ZONE_R, maxZoneHStretch: H_STRETCH,
            colorTop: C_TOP, colorMid: C_MID, colorBot: C_BOT, colorMidPoint,
            returnSpeed: RETURN_SPEED, mouseRadius: MOUSE_INFLUENCE_RADIUS, pushForce: PUSH_FORCE,
            ellipseA: ELLIPSE_A, ellipseB: ELLIPSE_B_REF, ellipseCY: ELLIPSE_CY,
        } = BALL_CONFIG;

        interface Particle {
            targetX: number;
            targetY: number;
            x: number;
            y: number;
            radius: number;
            color: string;
        }

        let particles: Particle[] = [];
        // Mutable draw params updated each resize so animation loop picks up scaled values
        let drawLineWidth = LINE_WIDTH_REF;
        let drawAnchorRadius = ANCHOR_RADIUS_REF;

        const initParticles = () => {
            particles = [];
            const w = canvas.width;
            const h = canvas.height;

            // ── Responsive scale (clamp between 55% and 100% of reference) ──────────
            const vwScale = Math.min(1.0, Math.max(0.55, w / BALL_REF_VW));
            const GAP        = Math.round(GAP_REF        * vwScale);
            const MAX_RADIUS = Math.round(MAX_RADIUS_REF * vwScale);
            const ELLIPSE_B  = Math.round(ELLIPSE_B_REF  * vwScale);
            drawLineWidth    = Math.max(1.5, LINE_WIDTH_REF    * vwScale);
            drawAnchorRadius = Math.max(2,   ANCHOR_RADIUS_REF * vwScale);

            // ── Zone height: navbar → top of MOTION DESIGNER divider ─────────────────
            // MOTION DESIGNER height = two double-rules + text block (matches HomePage)
            const mdFontSz = Math.max(96, Math.min(w * 0.17, 300)); // clamp(96px,17vw,300px)
            const mdHeight  = mdFontSz * 0.88            // text (lineHeight 0.88)
                            + w * (0.01 + 0.003)         // padTop(1vw) + padBot(0.3vw)
                            + 2 * (24 + 2);              // 2 double-rules × (RULE_GAP 24 + 2 lines)
            // Available space between navbar and MOTION DESIGNER divider
            const availH  = Math.max(h - navHeight - mdHeight, GAP * 2);
            // Fit as many complete rows as possible, then centre the zone with equal margins
            const rowsFit = Math.max(2, Math.floor(availH / GAP));
            const zoneH   = rowsFit * GAP;
            const margin  = (availH - zoneH) / 2;
            const zoneTop = navHeight + margin; // equal gap above and below

            const cols   = Math.ceil(w / GAP) + 2;
            const rows   = Math.ceil(zoneH / GAP) + 2;
            const startX = (w - (cols - 1) * GAP) / 2;
            const startY = zoneTop + (zoneH - (rows - 1) * GAP) / 2;

            // ── Ellipse zone ──────────────────────────────────────────────────────────
            const ellA  = w * ELLIPSE_A;
            const ellCx = w / 2;
            const ellCy = zoneTop + zoneH * ELLIPSE_CY;

            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const px = startX + c * GAP;
                    const py = startY + r * GAP;
                    if (px < -GAP || px > w + GAP) continue;
                    if (py < zoneTop - 2 || py > zoneTop + zoneH + 2) continue;

                    const t = (py - zoneTop) / zoneH;
                    let colorArr;
                    if (t < colorMidPoint) {
                        colorArr = lerpColor(C_TOP, C_MID, t / colorMidPoint);
                    } else {
                        colorArr = lerpColor(C_MID, C_BOT, (t - colorMidPoint) / (1 - colorMidPoint));
                    }
                    const color = rgbToHex(colorArr);

                    const edx = px - ellCx;
                    const edy = py - ellCy;
                    const ellipseNorm = Math.sqrt((edx * edx) / (ellA * ellA) + (edy * edy) / (ELLIPSE_B * ELLIPSE_B));
                    const insideEllipse = ellipseNorm <= 1;

                    const dx = px - w / 2;
                    const dy = py - (zoneTop + zoneH / 2);
                    const dist = Math.hypot(dx / H_STRETCH, dy);
                    const refR = Math.min(w, zoneH) * 0.55;
                    const gradDist = MAX_ZONE_R > 0 ? Math.max(0, dist - MAX_ZONE_R) : dist;
                    const normDist = Math.min(gradDist / refR, 1);
                    const radius = insideEllipse
                        ? MAX_RADIUS * (1 - 0.14 * ellipseNorm)
                        : MAX_RADIUS * (1 - normDist * edgeShrink);

                    particles.push({ targetX: px, targetY: py, x: px, y: py, radius, color });
                }
            }
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };
        window.addEventListener('resize', resize);
        resize();

        let mouse = { x: -1000, y: -1000 };
        let lastMouse = { x: -1000, y: -1000 };
        let isMouseMoving = false;
        let mouseStopTimer: number | null = null;

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            isMouseMoving = true;

            if (mouseStopTimer) {
                clearTimeout(mouseStopTimer);
            }
            mouseStopTimer = window.setTimeout(() => {
                isMouseMoving = false;
            }, 50);
        };
        window.addEventListener('mousemove', handleMouseMove);

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const mouseDx = mouse.x - lastMouse.x;
            const mouseDy = mouse.y - lastMouse.y;
            const mouseSpeed = Math.hypot(mouseDx, mouseDy);

            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;

            ctx.lineWidth = drawLineWidth;

            particles.forEach(p => {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.hypot(dx, dy);

                if (isMouseMoving && dist < MOUSE_INFLUENCE_RADIUS && dist > 0 && mouseSpeed > 0.5) {
                    const nx = -dx / dist;
                    const ny = -dy / dist;
                    const force = PUSH_FORCE * (1 - dist / MOUSE_INFLUENCE_RADIUS);
                    p.x += nx * force;
                    p.y += ny * force;
                }

                const returnDx = p.targetX - p.x;
                const returnDy = p.targetY - p.y;
                const returnDist = Math.hypot(returnDx, returnDy);

                if (returnDist > 0.5) {
                    p.x += returnDx * RETURN_SPEED;
                    p.y += returnDy * RETURN_SPEED;
                } else {
                    p.x = p.targetX;
                    p.y = p.targetY;
                }

                // 1. Draw Connection Line (White)
                ctx.beginPath();
                ctx.moveTo(p.targetX, p.targetY);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                // 2. Draw Anchor (White)
                ctx.beginPath();
                ctx.arc(p.targetX, p.targetY, drawAnchorRadius, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();

                // 3. Draw Main Sphere
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
            if (mouseStopTimer) clearTimeout(mouseStopTimer);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`${className} pointer-events-none`}
        />
    );
};

const StaticSpacedText: React.FC<{
    text: string;
    className?: string;
    charClassName?: string;
  }> = ({ text, className, charClassName }) => {
    return (
        <div className={`flex ${className}`}>
            {text.split('').map((char, i) => (
                <span 
                  key={i} 
                  className={`inline-block ${charClassName}`}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </div>
    )
  };

const RollButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => {
    return (
        <button 
            onClick={onClick}
            className="group relative h-12 w-48 overflow-hidden rounded-full border border-white/40 transition-all duration-300 bg-transparent hover:border-white/80 pointer-events-auto"
        >
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(
                        120px circle at var(--x, 50%) var(--y, 50%),
                        rgba(56, 189, 248, 0.5),
                        rgba(167, 243, 208, 0.3),
                        transparent 70%
                    )`
                }}
            />

            <div className="absolute top-0 left-0 w-full h-[200%] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2 z-10">
                <div className="flex h-1/2 w-full items-center justify-center">
                     <span className="text-sm font-bold tracking-[0.2em] text-white uppercase font-sans drop-shadow-md">
                        {label}
                    </span>
                </div>
                <div className="flex h-1/2 w-full items-center justify-center">
                    <span className="text-sm font-bold tracking-[0.2em] text-white uppercase font-sans drop-shadow-md">
                        {label}
                    </span>
                </div>
            </div>
        </button>
    );
};

// --- Slot Machine Character ---
// fixedDir: 固定方向（不传则 up↔left 交替）
// delay: 首次播放延迟 ms（不传则随机 500~2000ms）
const SlotChar: React.FC<{ char: string; fixedDir?: 'up' | 'left'; delay?: number; sequel?: 'up' | 'left' }> = ({ char, fixedDir, delay, sequel }) => {
    const measureRef = useRef<HTMLSpanElement>(null);
    const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
    const [yOff, setYOff] = useState(0);
    const [xOff, setXOff] = useState(0);
    const [dir, setDir]   = useState<'up' | 'left'>(fixedDir ?? 'up');
    const [anim, setAnim] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const spinRef  = useRef<() => void>(() => {});

useEffect(() => {
        const updateDims = () => {
            if (measureRef.current) {
                setDims({ w: measureRef.current.offsetWidth, h: measureRef.current.offsetHeight });
            }
        };

        // 1. 初始测量
        updateDims();

        // 2. 等待所有自定义字体加载完成后，重新测量
        document.fonts.ready.then(() => {
            updateDims();
        });

        // 3. 监听窗口缩放，确保字号随屏幕变化时也能对齐
        window.addEventListener('resize', updateDims);

        return () => {
            window.removeEventListener('resize', updateDims);
        };
    }, [char]);

    // 每次渲染刷新，捕获最新 dir / dims
    spinRef.current = () => {
        setAnim(true);
        if (dir === 'up')   setYOff(dims!.h);
        else                setXOff(dims!.w);

        timerRef.current = setTimeout(() => {
            const next = fixedDir ? fixedDir : (dir === 'up' ? 'left' : 'up');
            // sequel 存在时先切到 sequel 方向（影响进入字符的起始位置），再播第二段
            setAnim(false); setYOff(0); setXOff(0); setDir(sequel ?? next);

            if (sequel) {
                // 第一段结束 → 等 400ms → 播 sequel 方向第二段
                timerRef.current = setTimeout(() => {
                    setAnim(true);
                    if (sequel === 'up') setYOff(dims!.h);
                    else                setXOff(dims!.w);
                    timerRef.current = setTimeout(() => {
                        setAnim(false); setYOff(0); setXOff(0); setDir(fixedDir ?? 'up');
                        timerRef.current = setTimeout(() => spinRef.current(), 10000);
                    }, 700);
                }, 400);
            } else {
                timerRef.current = setTimeout(() => spinRef.current(), 10000);
            }
        }, 700);
    };

    useEffect(() => {
        if (!dims) return;
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const d = delay !== undefined ? delay : (500 + Math.random() * 1500);
        timerRef.current = setTimeout(() => spinRef.current(), d);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [dims]);

    if (!dims) return <span ref={measureRef} style={{ display: 'inline-block', verticalAlign: 'top' }}>{char}</span>;

    const TR = anim ? 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    const tx = `translate(${-xOff}px, ${-yOff}px)`;
    const enterTop  = dir === 'up'   ? dims.h : 0;
    const enterLeft = dir === 'left' ? dims.w : 0;

    return (
        <span style={{ display: 'inline-block', width: dims.w, height: dims.h, overflow: 'hidden', position: 'relative', verticalAlign: 'top' }}>
            <span style={{ position: 'absolute', top: 0, left: 0, transform: tx, transition: TR, willChange: 'transform' }}>
                {char}
            </span>
            <span style={{ position: 'absolute', top: enterTop, left: enterLeft, transform: tx, transition: TR, willChange: 'transform' }}>
                {char}
            </span>
        </span>
    );
};

const SpotlightGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const buttons = container.querySelectorAll('button');
            buttons.forEach((btn) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                (btn as HTMLElement).style.setProperty('--x', `${x}px`);
                (btn as HTMLElement).style.setProperty('--y', `${y}px`);
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
};

/**
 * Commercial Page
 */
// 数字能源 S1 官网素材（本地文件放 public/energy/ 目录下）
const ENERGY_S1_DATA: { type: 'video' | 'image'; src: string; name: string }[] = [
    { type: 'video', src: 'https://solar.huawei.com/admin/asset/v1/pro/view/330af497446a4a59bba4c0594148980a.mp4', name: '首页 Banner' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/2更多电量，更久守护.png',   name: '更多电量，更久守护' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/3静音运行.jpg',             name: '静音运行' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/4快充快放，超乎想象.png',   name: '快充快放，超乎想象' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/5高可靠电芯.png',           name: '高可靠电芯' },
    { type: 'video', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/6主动隔离防护.mp4',         name: '主动隔离防护' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/7零度不影响工作.jpg',       name: '零度不影响工作' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/8浸水防护.png',             name: '浸水防护' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/9高强抗压.png',             name: '高强抗压' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/10电芯级管理.png',          name: '电芯级管理' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/11应急消防.png',            name: '应急消防' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/12主动泄压及时防护.png',    name: '主动泄压及时防护' },
];
// 灯箱可导航图片：ENERGY_S1_DATA 的 index，按页面展示顺序排列
const ENERGY_LIGHTBOX = [3, 10, 9, 8, 11, 2, 6, 1, 4];

const ENERGY_S2_DATA: { type: 'video' | 'image'; src: string; name: string }[] = [
    { type: 'video', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.1首页使用.mp4',            name: '首页 Banner' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.2液冷超充.jpg',            name: '液冷超充' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.3极速充电.jpg',            name: '极速充电' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.4极高质量.jpg',            name: '极高质量' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.5融合光储.jpg',            name: '融合光储' },
    { type: 'video', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.6充电模块banner.mp4',      name: '充电模块 Banner' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.7充电模块.jpg',            name: '充电模块' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.8Smart cooling.jpg',       name: 'Smart Cooling' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.9Smart cooling2.jpg',      name: 'Smart Cooling 2' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.10Prefabricated.jpg',      name: 'Prefabricated' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.11数据中心.jpg',           name: '数据中心' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.12数据中心2.jpg',          name: '数据中心 2' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.13智慧新模块.jpg',         name: '智慧新模块' },
    { type: 'video', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.14B+级纯电动解决方案.mp4', name: 'B+级纯电动解决方案' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.15电机1.jpg',              name: '电机 1' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.16电机2.jpg',              name: '电机 2' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.17电机3.jpg',              name: '电机 3' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.18B级底盘.png',            name: 'B级底盘' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.19角度1.png',              name: '角度 1' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.20角度2.jpg',              name: '角度 2' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/02-System%20design/2.21角度3.jpg',              name: '角度 3' },
];
const STD_LIGHTBOX = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20];

const ENERGY_S3_DATA: { type: 'video' | 'image'; src: string; name: string }[] = [
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/03-Rendering/01ZERO%20Design%20System.png',    name: 'ZERO Design System 01' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/03-Rendering/02ZERO%20Design%20System.png',    name: 'ZERO Design System 02' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/03-Rendering/03ZERO%20Design%20System.png',    name: 'ZERO Design System 03' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/03-Rendering/04FusionSolar.png',               name: 'FusionSolar' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/03-Rendering/05智能管理系统.png',               name: '智能管理系统' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/03-Rendering/06Products%20%20Solutions.jpg',   name: 'Products & Solutions' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/03-Rendering/07助力城市绿色高质量发展.jpg',    name: '助力城市绿色高质量发展' },
    { type: 'video', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/03-Rendering/08charging5-video.mov',           name: 'Charging Video' },
    { type: 'video', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/03-Rendering/09智能组串式储能系统.mp4',         name: '智能组串式储能系统' },
];
const RENDERING_LIGHTBOX = [0, 1, 2, 3, 4, 5, 6];

const ENERGY_S4_DATA: { type: 'video' | 'image'; src: string; name: string }[] = [
    { type: 'video', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/04/01banner.mp4', name: 'Banner' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/04/02.png',       name: '02' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/04/03.png',       name: '03' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/04/04.png',       name: '04' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/04/05.png',       name: '05' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/04/06.png',       name: '06' },
];
const LOG_LIGHTBOX = [1, 2, 3, 4, 5];

const ENERGY_S5_DATA: { type: 'video' | 'image'; src: string; name: string }[] = [
    { type: 'video', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/05/01banner.mp4', name: 'Banner' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/05/02.webp',      name: '02' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/05/03.webp',      name: '03' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/05/04.webp',      name: '04' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/05/05.webp',      name: '05' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/05/06.webp',      name: '06' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/05/07.webp',      name: '07' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/05/08.webp',      name: '08' },
    { type: 'image', src: 'https://weilu-design-1405746396.cos.ap-hongkong.myqcloud.com/energy/05/09.webp',      name: '09' },
];
const VIS_LIGHTBOX = [1, 2, 3, 4, 5, 6, 7, 8];

const CommercialPage: React.FC = () => {
    const [energyModalOpen, setEnergyModalOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
    const leftOverlayRef  = useRef<HTMLDivElement>(null);
    const rightOverlayRef = useRef<HTMLDivElement>(null);
    const [stdModalOpen, setStdModalOpen] = useState(false);
    const [stdLightboxIdx, setStdLightboxIdx] = useState<number | null>(null);
    const stdLeftOverlayRef  = useRef<HTMLDivElement>(null);
    const stdRightOverlayRef = useRef<HTMLDivElement>(null);
    const [renderingModalOpen, setRenderingModalOpen] = useState(false);
    const [renderingLightboxIdx, setRenderingLightboxIdx] = useState<number | null>(null);
    const renderingLeftOverlayRef  = useRef<HTMLDivElement>(null);
    const renderingRightOverlayRef = useRef<HTMLDivElement>(null);
    const [logModalOpen, setLogModalOpen] = useState(false);
    const [logLightboxIdx, setLogLightboxIdx] = useState<number | null>(null);
    const logLeftOverlayRef  = useRef<HTMLDivElement>(null);
    const logRightOverlayRef = useRef<HTMLDivElement>(null);
    const [visModalOpen, setVisModalOpen] = useState(false);
    const [visLightboxIdx, setVisLightboxIdx] = useState<number | null>(null);
    const visLeftOverlayRef  = useRef<HTMLDivElement>(null);
    const visRightOverlayRef = useRef<HTMLDivElement>(null);

    // 键盘：ESC 先关灯箱再关弹出层；← → 切换灯箱图片
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (lightboxIdx !== null) setLightboxIdx(null);
                else if (stdLightboxIdx !== null) setStdLightboxIdx(null);
                else if (renderingLightboxIdx !== null) setRenderingLightboxIdx(null);
                else if (energyModalOpen) setEnergyModalOpen(false);
                else if (stdModalOpen) setStdModalOpen(false);
                else if (renderingModalOpen) setRenderingModalOpen(false);
                else if (logModalOpen) setLogModalOpen(false);
                else if (visModalOpen) setVisModalOpen(false);
            }
            if (lightboxIdx !== null) {
                if (e.key === 'ArrowLeft')  setLightboxIdx(i => Math.max(0, (i ?? 0) - 1));
                if (e.key === 'ArrowRight') setLightboxIdx(i => Math.min(ENERGY_LIGHTBOX.length - 1, (i ?? 0) + 1));
            }
            if (stdLightboxIdx !== null) {
                if (e.key === 'ArrowLeft')  setStdLightboxIdx(i => Math.max(0, (i ?? 0) - 1));
                if (e.key === 'ArrowRight') setStdLightboxIdx(i => Math.min(STD_LIGHTBOX.length - 1, (i ?? 0) + 1));
            }
            if (renderingLightboxIdx !== null) {
                if (e.key === 'ArrowLeft')  setRenderingLightboxIdx(i => Math.max(0, (i ?? 0) - 1));
                if (e.key === 'ArrowRight') setRenderingLightboxIdx(i => Math.min(RENDERING_LIGHTBOX.length - 1, (i ?? 0) + 1));
            }
            if (logLightboxIdx !== null) {
                if (e.key === 'ArrowLeft')  setLogLightboxIdx(i => Math.max(0, (i ?? 0) - 1));
                if (e.key === 'ArrowRight') setLogLightboxIdx(i => Math.min(LOG_LIGHTBOX.length - 1, (i ?? 0) + 1));
            }
            if (visLightboxIdx !== null) {
                if (e.key === 'ArrowLeft')  setVisLightboxIdx(i => Math.max(0, (i ?? 0) - 1));
                if (e.key === 'ArrowRight') setVisLightboxIdx(i => Math.min(VIS_LIGHTBOX.length - 1, (i ?? 0) + 1));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxIdx, stdLightboxIdx, renderingLightboxIdx, logLightboxIdx, visLightboxIdx, energyModalOpen, stdModalOpen, renderingModalOpen, logModalOpen, visModalOpen]);

    // 阻止左右暗区滚动穿透至主页面
    useEffect(() => {
        if (!energyModalOpen) return;
        const prevent = (e: WheelEvent) => e.preventDefault();
        const l = leftOverlayRef.current;
        const r = rightOverlayRef.current;
        l?.addEventListener('wheel', prevent, { passive: false });
        r?.addEventListener('wheel', prevent, { passive: false });
        return () => {
            l?.removeEventListener('wheel', prevent);
            r?.removeEventListener('wheel', prevent);
        };
    }, [energyModalOpen]);

    useEffect(() => {
        if (!stdModalOpen) return;
        const prevent = (e: WheelEvent) => e.preventDefault();
        const l = stdLeftOverlayRef.current;
        const r = stdRightOverlayRef.current;
        l?.addEventListener('wheel', prevent, { passive: false });
        r?.addEventListener('wheel', prevent, { passive: false });
        return () => {
            l?.removeEventListener('wheel', prevent);
            r?.removeEventListener('wheel', prevent);
        };
    }, [stdModalOpen]);

    const openLightbox = (dataIdx: number) => {
        const lbIdx = ENERGY_LIGHTBOX.indexOf(dataIdx);
        if (lbIdx !== -1) setLightboxIdx(lbIdx);
    };

    const openStdLightbox = (dataIdx: number) => {
        const lbIdx = STD_LIGHTBOX.indexOf(dataIdx);
        if (lbIdx !== -1) setStdLightboxIdx(lbIdx);
    };

    useEffect(() => {
        if (!renderingModalOpen) return;
        const prevent = (e: WheelEvent) => e.preventDefault();
        const l = renderingLeftOverlayRef.current;
        const r = renderingRightOverlayRef.current;
        l?.addEventListener('wheel', prevent, { passive: false });
        r?.addEventListener('wheel', prevent, { passive: false });
        return () => {
            l?.removeEventListener('wheel', prevent);
            r?.removeEventListener('wheel', prevent);
        };
    }, [renderingModalOpen]);

    const openRenderingLightbox = (dataIdx: number) => {
        const lbIdx = RENDERING_LIGHTBOX.indexOf(dataIdx);
        if (lbIdx !== -1) setRenderingLightboxIdx(lbIdx);
    };

    useEffect(() => {
        if (!logModalOpen) return;
        const prevent = (e: WheelEvent) => e.preventDefault();
        const l = logLeftOverlayRef.current;
        const r = logRightOverlayRef.current;
        l?.addEventListener('wheel', prevent, { passive: false });
        r?.addEventListener('wheel', prevent, { passive: false });
        return () => {
            l?.removeEventListener('wheel', prevent);
            r?.removeEventListener('wheel', prevent);
        };
    }, [logModalOpen]);

    const openLogLightbox = (dataIdx: number) => {
        const lbIdx = LOG_LIGHTBOX.indexOf(dataIdx);
        if (lbIdx !== -1) setLogLightboxIdx(lbIdx);
    };

    useEffect(() => {
        if (!visModalOpen) return;
        const prevent = (e: WheelEvent) => e.preventDefault();
        const l = visLeftOverlayRef.current;
        const r = visRightOverlayRef.current;
        l?.addEventListener('wheel', prevent, { passive: false });
        r?.addEventListener('wheel', prevent, { passive: false });
        return () => {
            l?.removeEventListener('wheel', prevent);
            r?.removeEventListener('wheel', prevent);
        };
    }, [visModalOpen]);

    const openVisLightbox = (dataIdx: number) => {
        const lbIdx = VIS_LIGHTBOX.indexOf(dataIdx);
        if (lbIdx !== -1) setVisLightboxIdx(lbIdx);
    };

    // 左右暗区自定义光标：白色圆形减号
    const sideCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='16' cy='16' r='14' fill='none' stroke='white' stroke-width='2'/%3E%3Cline x1='8' y1='16' x2='24' y2='16' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 16 16, pointer`;

    return (
        <div
            id="commercial-section"
            className="relative z-10 w-full shadow-[0_-50px_100px_rgba(0,0,0,0.5)]"
            style={{ background: 'linear-gradient(180deg, #000000 0%, #000000 20%, #0a0a0a 100%)' }}
        >
            <div className="relative">
                <div className="sticky top-0 z-50 w-full flex justify-center items-center px-8 py-8 bg-black/50 backdrop-blur-md border-b border-white/10">
                    <h2 className="text-white uppercase"
                        style={{ fontFamily: '"Bebas Neue", "Inter", "Arial Black", sans-serif', fontSize: 'clamp(72px, 10vw, 160px)', fontWeight: 400, letterSpacing: '0.12em', lineHeight: 1 }}>
                        WORK
                    </h2>
                </div>

                <div className="w-full">
                    {COMMERCIAL_DATA.map((item, index) => {
                        const isEnergy = item.id === 'exp';
                        const isStd        = item.id === 'std';
                        const isRendering  = item.id === 'del';
                        const isLog        = item.id === 'log';
                        const isVis        = item.id === 'vis';
                        return (
                        <div key={item.id} className="group w-full grid grid-cols-1 md:grid-cols-[62.5%_37.5%] border-b-2 border-white last:border-0"
                             style={{ minHeight: 'clamp(300px, 32vw, 700px)' }}>
                             <div
                                className="relative border-r-0 md:border-r-2 border-white overflow-hidden bg-white/5 group-hover:bg-white/10 transition-colors"
                                onClick={isEnergy ? () => setEnergyModalOpen(true) : isStd ? () => setStdModalOpen(true) : isRendering ? () => setRenderingModalOpen(true) : isLog ? () => setLogModalOpen(true) : isVis ? () => setVisModalOpen(true) : undefined}
                                style={(isEnergy || isStd || isRendering || isLog || isVis) ? { cursor: 'pointer' } : undefined}
                             >
                                {item.video ? (
                                    <>
                                        <video src={item.video} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500"></div>
                                    </>
                                ) : item.image ? (
                                    <>
                                        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                        <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500"></div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-white/10">
                                        <div className="text-[10vw] font-serif italic">{index + 1}</div>
                                    </div>
                                )}
                                {(!item.video && !item.image) && (
                                    <div className="absolute bottom-8 left-8 text-white/40 font-mono text-sm">{item.tags.join(' / ')}</div>
                                )}
                                {(item.video || item.image) && (
                                    <div className="absolute top-8 left-8 text-white/80 font-mono text-sm z-10 bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
                                        0{index + 1} &mdash; {item.tags[0]}
                                    </div>
                                )}
                             </div>
                             <div
                                className="flex flex-col justify-center bg-transparent group-hover:bg-blue-900/10 transition-colors"
                                onClick={isEnergy ? () => setEnergyModalOpen(true) : isStd ? () => setStdModalOpen(true) : isRendering ? () => setRenderingModalOpen(true) : isLog ? () => setLogModalOpen(true) : isVis ? () => setVisModalOpen(true) : undefined}
                                style={(isEnergy || isStd || isRendering || isLog || isVis) ? { cursor: 'pointer', padding: 'clamp(1.5rem, 3.5vw, 4rem)' } : { padding: 'clamp(1.5rem, 3.5vw, 4rem)' }}
                             >
                                <div className="flex items-center space-x-4 mb-6 text-sm font-bold">
                                    <span className="text-white" style={{ fontSize: 'clamp(0.9rem, 1.2vw, 1.125rem)' }}>0{index + 1}</span>
                                    <span className="h-[2px] w-8 bg-white"></span>
                                </div>
                                <h3 className="font-bold text-white mb-4 font-serif group-hover:text-blue-400 transition-colors"
                                    style={{ fontSize: 'clamp(1.5rem, 2.8vw, 3rem)', lineHeight: 1.15 }}>{item.title}</h3>
                                <h4 className="text-gray-400 mb-6 font-light uppercase tracking-wide"
                                    style={{ fontSize: 'clamp(0.75rem, 1vw, 1.1rem)' }}>{item.subtitle}</h4>
                                <p className="text-gray-300 leading-relaxed text-justify font-light"
                                    style={{ fontSize: 'clamp(0.8rem, 1vw, 1rem)' }}>{item.description}</p>
                             </div>
                        </div>
                        );
                    })}
                </div>
            </div>

            {/* ── 数字能源详情弹出层 ── */}
            {energyModalOpen && (
                <div className="fixed inset-0 z-[9000] flex">
                    {/* 左侧暗区（阻止滚动穿透，自定义光标） */}
                    <div
                        ref={leftOverlayRef}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', cursor: sideCursor }}
                        onClick={() => setEnergyModalOpen(false)}
                    />
                    {/* 中间内容面板（3/5 宽，可滚动） */}
                    <div style={{ flex: 3, background: '#0a0a0a', overflowY: 'auto', height: '100vh', position: 'relative' }}>
                        {/* 关闭栏 */}
                        <button onClick={() => setEnergyModalOpen(false)} style={{
                            position: 'sticky', top: 0, zIndex: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                            width: '100%', padding: '12px 20px',
                            background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(8px)',
                            border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace',
                            fontSize: '12px', letterSpacing: '0.2em', cursor: 'pointer',
                        }}>ESC · CLOSE ✕</button>

                        {/* 1. Banner 视频 */}
                        <video src={ENERGY_S1_DATA[0].src} autoPlay loop muted playsInline style={{ width: '100%', display: 'block' }} />

                        {/* 2. 文字介绍 */}
                        <div style={{ padding: '52px 48px', textAlign: 'center' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.9, fontWeight: 300, maxWidth: '560px', margin: '0 auto', letterSpacing: '0.02em' }}>
                                负责 LUNA2000 S1 系列全场景的三维视觉构建。在制作过程中，我试图剥离冗余的修饰，将重点回归至材质细节与光影的真实反馈。通过对场景深度与建筑感的打磨，让原本冷峻的能源设备在现代家居语境中找到合理的视觉落点。<br />
                                <a href="https://solar.huawei.com/cn/products/LUNA2000-7-14-21-S1/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '0.03em', wordBreak: 'break-all' }}>
                                    https://solar.huawei.com/cn/products/LUNA2000-7-14-21-S1/
                                </a>
                            </p>
                        </div>

                        {/* 3. 三列：[4快充快放][11应急消防][10电芯级管理] */}
                        <div style={{ display: 'flex', gap: '4px', height: '26vw' }}>
                            {[3, 10, 9].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S1_DATA[di].src} alt={ENERGY_S1_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                                        onClick={() => openLightbox(di)} />
                                </div>
                            ))}
                        </div>

                        {/* 4. 两列：[9高强抗压][12主动泄压及时防护] */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', height: '30vw' }}>
                            {[8, 11].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S1_DATA[di].src} alt={ENERGY_S1_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                                        onClick={() => openLightbox(di)} />
                                </div>
                            ))}
                        </div>

                        {/* 5. 全宽：[3静音运行] */}
                        <img src={ENERGY_S1_DATA[2].src} alt={ENERGY_S1_DATA[2].name}
                            style={{ width: '100%', display: 'block', marginTop: '4px', cursor: 'zoom-in' }}
                            onClick={() => openLightbox(2)} />

                        {/* 6. 全宽：[7零度不影响工作] */}
                        <img src={ENERGY_S1_DATA[6].src} alt={ENERGY_S1_DATA[6].name}
                            style={{ width: '100%', display: 'block', marginTop: '4px', cursor: 'zoom-in' }}
                            onClick={() => openLightbox(6)} />

                        {/* 7. 两列：[2更多电量，更久守护][5高可靠电芯] */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', height: '30vw' }}>
                            {[1, 4].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S1_DATA[di].src} alt={ENERGY_S1_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                                        onClick={() => openLightbox(di)} />
                                </div>
                            ))}
                        </div>

                        {/* 8. 全宽视频：[6主动隔离防护] */}
                        <video src={ENERGY_S1_DATA[5].src} autoPlay loop muted playsInline
                            style={{ width: '100%', display: 'block', marginTop: '4px' }} />
                    </div>
                    {/* 右侧暗区（阻止滚动穿透，自定义光标） */}
                    <div
                        ref={rightOverlayRef}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', cursor: sideCursor }}
                        onClick={() => setEnergyModalOpen(false)}
                    />
                </div>
            )}

            {/* ── 02-System Design 详情弹出层 ── */}
            {stdModalOpen && (
                <div className="fixed inset-0 z-[9000] flex">
                    <div
                        ref={stdLeftOverlayRef}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', cursor: sideCursor }}
                        onClick={() => setStdModalOpen(false)}
                    />
                    <div style={{ flex: 3, background: '#0a0a0a', overflowY: 'auto', height: '100vh', position: 'relative' }}>
                        <button onClick={() => setStdModalOpen(false)} style={{
                            position: 'sticky', top: 0, zIndex: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                            width: '100%', padding: '12px 20px',
                            background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(8px)',
                            border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace',
                            fontSize: '12px', letterSpacing: '0.2em', cursor: 'pointer',
                        }}>ESC · CLOSE ✕</button>

                        {/* ── 第一段：2.1–2.5 超充网络 ── */}
                        <video src={ENERGY_S2_DATA[0].src} autoPlay loop muted playsInline style={{ width: '100%', display: 'block' }} />
                        <div style={{ padding: '52px 48px', textAlign: 'center' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.9, fontWeight: 300, maxWidth: '560px', margin: '0 auto', letterSpacing: '0.02em' }}>
                                新一代全液冷超充官网<br />
                                <a href="https://digitalpower.huawei.com/cn/smart-charging-network/ultra-fast-charging" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '0.03em', wordBreak: 'break-all' }}>
                                    https://digitalpower.huawei.com/cn/smart-charging-network/ultra-fast-charging
                                </a>
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', height: '30vw' }}>
                            {[1, 2].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S2_DATA[di].src} alt={ENERGY_S2_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in', objectPosition: di === 1 ? '74% center' : di === 2 ? '11% center' : 'center' }}
                                        onClick={() => openStdLightbox(di)} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', height: '30vw' }}>
                            {[3, 4].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S2_DATA[di].src} alt={ENERGY_S2_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in', objectPosition: di === 3 ? '80% center' : 'center' }}
                                        onClick={() => openStdLightbox(di)} />
                                </div>
                            ))}
                        </div>

                        {/* ── 第二段：2.6–2.7 充电模块 ── */}
                        <video src={ENERGY_S2_DATA[5].src} autoPlay loop muted playsInline style={{ width: '100%', display: 'block', marginTop: '80px' }} />
                        <div style={{ padding: '52px 48px', textAlign: 'center' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.9, fontWeight: 300, maxWidth: '560px', margin: '0 auto', letterSpacing: '0.02em' }}>
                                充电模块<br />
                                <a href="https://digitalpower.huawei.com/cn/smart-charging-network/charging-module" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '0.03em', wordBreak: 'break-all' }}>
                                    https://digitalpower.huawei.com/cn/smart-charging-network/charging-module
                                </a>
                            </p>
                        </div>
                        <img src={ENERGY_S2_DATA[6].src} alt={ENERGY_S2_DATA[6].name}
                            style={{ width: '100%', display: 'block', cursor: 'zoom-in' }}
                            onClick={() => openStdLightbox(6)} />

                        {/* ── 第三段：2.8–2.13 Smart Cooling & 数据中心 ── */}
                        <img src={ENERGY_S2_DATA[7].src} alt={ENERGY_S2_DATA[7].name}
                            style={{ width: '100%', display: 'block', marginTop: '80px', cursor: 'zoom-in' }}
                            onClick={() => openStdLightbox(7)} />
                        <div style={{ padding: '52px 48px', textAlign: 'center' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.9, fontWeight: 300, maxWidth: '560px', margin: '0 auto', letterSpacing: '0.02em' }}>
                                数据中心能源及关键供电<br />
                                <a href="https://digitalpower.huawei.com/cn/data-center-facility" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '0.03em', wordBreak: 'break-all' }}>
                                    https://digitalpower.huawei.com/cn/data-center-facility
                                </a>
                            </p>
                        </div>
                        {/* 2.9 单独一排 */}
                        <img src={ENERGY_S2_DATA[8].src} alt={ENERGY_S2_DATA[8].name}
                            style={{ width: '100%', display: 'block', cursor: 'zoom-in' }}
                            onClick={() => openStdLightbox(8)} />
                        {/* 2.11 / 2.12 / 2.13 三列 */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', height: '26vw' }}>
                            {[10, 11, 12].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S2_DATA[di].src} alt={ENERGY_S2_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in', objectPosition: di === 10 ? '10% center' : di === 12 ? '50% center' : 'center' }}
                                        onClick={() => openStdLightbox(di)} />
                                </div>
                            ))}
                        </div>
                        {/* 2.10 单独一排，放在最后 */}
                        <img src={ENERGY_S2_DATA[9].src} alt={ENERGY_S2_DATA[9].name}
                            style={{ width: '100%', display: 'block', marginTop: '4px', cursor: 'zoom-in' }}
                            onClick={() => openStdLightbox(9)} />

                        {/* ── 第四段：2.14–2.21 新能源汽车 ── */}
                        <video src={ENERGY_S2_DATA[13].src} autoPlay loop muted playsInline style={{ width: '100%', display: 'block', marginTop: '80px' }} />
                        <div style={{ padding: '52px 48px', textAlign: 'center' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.9, fontWeight: 300, maxWidth: '560px', margin: '0 auto', letterSpacing: '0.02em' }}>
                                B+级纯电运动域解决方案<br />
                                <a href="https://digitalpower.huawei.com/cn/driveone/emobility-solution-b" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '0.03em', wordBreak: 'break-all' }}>
                                    https://digitalpower.huawei.com/cn/driveone/emobility-solution-b
                                </a>
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', height: '26vw' }}>
                            {[14, 15, 16].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S2_DATA[di].src} alt={ENERGY_S2_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in', objectPosition: di === 14 ? '22% center' : di === 15 ? '71.5% center' : di === 16 ? '23% center' : 'center' }}
                                        onClick={() => openStdLightbox(di)} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', height: '30vw' }}>
                            {[17, 18].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S2_DATA[di].src} alt={ENERGY_S2_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in', objectPosition: di === 18 ? '75% center' : 'center' }}
                                        onClick={() => openStdLightbox(di)} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', height: '30vw' }}>
                            {[19, 20].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S2_DATA[di].src} alt={ENERGY_S2_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                                        onClick={() => openStdLightbox(di)} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div
                        ref={stdRightOverlayRef}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', cursor: sideCursor }}
                        onClick={() => setStdModalOpen(false)}
                    />
                </div>
            )}

            {/* ── 02-System Design 图片灯箱 ── */}
            {stdLightboxIdx !== null && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9100, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', zIndex: 1,
                        cursor: stdLightboxIdx === 0 ? 'default' : 'w-resize',
                    }} onClick={() => setStdLightboxIdx(i => Math.max(0, (i ?? 0) - 1))} />
                    <div style={{
                        position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', zIndex: 1,
                        cursor: stdLightboxIdx === STD_LIGHTBOX.length - 1 ? 'default' : 'e-resize',
                    }} onClick={() => setStdLightboxIdx(i => Math.min(STD_LIGHTBOX.length - 1, (i ?? 0) + 1))} />
                    <div style={{ position: 'relative', display: 'inline-block', zIndex: 2 }} onClick={e => e.stopPropagation()}>
                        <img
                            src={ENERGY_S2_DATA[STD_LIGHTBOX[stdLightboxIdx]].src}
                            alt=""
                            style={{ maxWidth: '80vw', maxHeight: '90vh', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
                        />
                    </div>
                    <button onClick={() => setStdLightboxIdx(null)} style={{
                        position: 'absolute', top: '80px', right: '28px',
                        width: '36px', height: '36px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.35)',
                        color: 'white', fontSize: '13px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                    <div style={{
                        position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)',
                        width: '44px', height: '44px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white', fontSize: '22px', pointerEvents: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: stdLightboxIdx === 0 ? 0.25 : 1,
                    }}>‹</div>
                    <div style={{
                        position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)',
                        width: '44px', height: '44px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white', fontSize: '22px', pointerEvents: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: stdLightboxIdx === STD_LIGHTBOX.length - 1 ? 0.25 : 1,
                    }}>›</div>
                </div>
            )}

            {/* ── 03-Rendering 详情弹出层 ── */}
            {renderingModalOpen && (
                <div className="fixed inset-0 z-[9000] flex">
                    <div
                        ref={renderingLeftOverlayRef}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', cursor: sideCursor }}
                        onClick={() => setRenderingModalOpen(false)}
                    />
                    <div style={{ flex: 3, background: '#0a0a0a', overflowY: 'auto', height: '100vh', position: 'relative' }}>
                        <button onClick={() => setRenderingModalOpen(false)} style={{
                            position: 'sticky', top: 0, zIndex: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                            width: '100%', padding: '12px 20px',
                            background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(8px)',
                            border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace',
                            fontSize: '12px', letterSpacing: '0.2em', cursor: 'pointer',
                        }}>ESC · CLOSE ✕</button>

                        {/* 1. 全宽图片：ZERO Design System 01 */}
                        <img src={ENERGY_S3_DATA[0].src} alt={ENERGY_S3_DATA[0].name}
                            style={{ width: '100%', display: 'block', cursor: 'zoom-in' }}
                            onClick={() => openRenderingLightbox(0)} />

                        {/* 2. 文字介绍 */}
                        <div style={{ padding: '52px 48px', textAlign: 'center' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.9, fontWeight: 300, maxWidth: '560px', margin: '0 auto', letterSpacing: '0.02em' }}>
                                这是一次关于数字能源全业态三维表现的系统化数字孪生实践。该规范涵盖了从工商业光储充运维到数据中心智能管理的全场景。我们通过 L1-L3 的层级化建模策略，实现了场景复杂度与渲染性能的动态平衡。在设计过程中，我重点处理了语义抽象与符号化表现的融合，确保了产品在不同维度下（如 App 能流关系与 Web 运维地图）都能精准传递核心信息及整体的一致化。
                            </p>
                        </div>

                        {/* 3. 全宽图片：ZERO Design System 02 */}
                        <img src={ENERGY_S3_DATA[1].src} alt={ENERGY_S3_DATA[1].name}
                            style={{ width: '100%', display: 'block', cursor: 'zoom-in' }}
                            onClick={() => openRenderingLightbox(1)} />

                        {/* 4. 全宽图片：ZERO Design System 03 */}
                        <img src={ENERGY_S3_DATA[2].src} alt={ENERGY_S3_DATA[2].name}
                            style={{ width: '100%', display: 'block', marginTop: '4px', cursor: 'zoom-in' }}
                            onClick={() => openRenderingLightbox(2)} />

                        {/* 5. 两列：FusionSolar / 智能管理系统 */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', height: '30vw' }}>
                            {[3, 4].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S3_DATA[di].src} alt={ENERGY_S3_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in', objectPosition: di === 4 ? '75% center' : 'center' }}
                                        onClick={() => openRenderingLightbox(di)} />
                                </div>
                            ))}
                        </div>

                        {/* 6. 全宽图片：Products & Solutions */}
                        <img src={ENERGY_S3_DATA[5].src} alt={ENERGY_S3_DATA[5].name}
                            style={{ width: '100%', display: 'block', marginTop: '4px', cursor: 'zoom-in' }}
                            onClick={() => openRenderingLightbox(5)} />

                        {/* 7. 全宽图片：助力城市绿色高质量发展 */}
                        <img src={ENERGY_S3_DATA[6].src} alt={ENERGY_S3_DATA[6].name}
                            style={{ width: '100%', display: 'block', marginTop: '4px', cursor: 'zoom-in' }}
                            onClick={() => openRenderingLightbox(6)} />

                        {/* 8. 全宽视频：Charging Video */}
                        <video src={ENERGY_S3_DATA[7].src} autoPlay loop muted playsInline
                            style={{ width: '100%', display: 'block', marginTop: '4px' }} />

                        {/* 9. 全宽视频：智能组串式储能系统 */}
                        <video src={ENERGY_S3_DATA[8].src} autoPlay loop muted playsInline
                            style={{ width: '100%', display: 'block', marginTop: '4px' }} />
                    </div>
                    <div
                        ref={renderingRightOverlayRef}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', cursor: sideCursor }}
                        onClick={() => setRenderingModalOpen(false)}
                    />
                </div>
            )}

            {/* ── 03-Rendering 图片灯箱 ── */}
            {renderingLightboxIdx !== null && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9100, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', zIndex: 1,
                        cursor: renderingLightboxIdx === 0 ? 'default' : 'w-resize',
                    }} onClick={() => setRenderingLightboxIdx(i => Math.max(0, (i ?? 0) - 1))} />
                    <div style={{
                        position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', zIndex: 1,
                        cursor: renderingLightboxIdx === RENDERING_LIGHTBOX.length - 1 ? 'default' : 'e-resize',
                    }} onClick={() => setRenderingLightboxIdx(i => Math.min(RENDERING_LIGHTBOX.length - 1, (i ?? 0) + 1))} />
                    <div style={{ position: 'relative', display: 'inline-block', zIndex: 2 }} onClick={e => e.stopPropagation()}>
                        <img
                            src={ENERGY_S3_DATA[RENDERING_LIGHTBOX[renderingLightboxIdx]].src}
                            alt=""
                            style={{ maxWidth: '80vw', maxHeight: '90vh', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
                        />
                    </div>
                    <button onClick={() => setRenderingLightboxIdx(null)} style={{
                        position: 'absolute', top: '80px', right: '28px',
                        width: '36px', height: '36px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.35)',
                        color: 'white', fontSize: '13px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                    <div style={{
                        position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)',
                        width: '44px', height: '44px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white', fontSize: '22px', pointerEvents: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: renderingLightboxIdx === 0 ? 0.25 : 1,
                    }}>‹</div>
                    <div style={{
                        position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)',
                        width: '44px', height: '44px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white', fontSize: '22px', pointerEvents: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: renderingLightboxIdx === RENDERING_LIGHTBOX.length - 1 ? 0.25 : 1,
                    }}>›</div>
                </div>
            )}

            {/* ── 04 详情弹出层 ── */}
            {logModalOpen && (
                <div className="fixed inset-0 z-[9000] flex">
                    <div
                        ref={logLeftOverlayRef}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', cursor: sideCursor }}
                        onClick={() => setLogModalOpen(false)}
                    />
                    <div style={{ flex: 3, background: '#0a0a0a', overflowY: 'auto', height: '100vh', position: 'relative' }}>
                        <button onClick={() => setLogModalOpen(false)} style={{
                            position: 'sticky', top: 0, zIndex: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                            width: '100%', padding: '12px 20px',
                            background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(8px)',
                            border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace',
                            fontSize: '12px', letterSpacing: '0.2em', cursor: 'pointer',
                        }}>ESC · CLOSE ✕</button>

                        {/* 1. Banner 视频 */}
                        <video src={ENERGY_S4_DATA[0].src} autoPlay loop muted playsInline style={{ width: '100%', display: 'block' }} />

                        {/* 2. 文字介绍 */}
                        <div style={{ padding: '52px 48px', textAlign: 'center' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.9, fontWeight: 300, maxWidth: '560px', margin: '0 auto', letterSpacing: '0.02em' }}>
                                前公司邀请制作 2025 款银箔大理石茶几产品视频。我试图通过的光影营造氛围，捕捉其冷峻而丰富的细节。在静谧的氛围中，展现材质本身的力量感与银箔工艺的精致。
                            </p>
                        </div>

                        {/* 3. 全宽：02 */}
                        <img src={ENERGY_S4_DATA[1].src} alt={ENERGY_S4_DATA[1].name}
                            style={{ width: '100%', display: 'block', cursor: 'zoom-in' }}
                            onClick={() => openLogLightbox(1)} />

                        {/* 4. 全宽：03 */}
                        <img src={ENERGY_S4_DATA[2].src} alt={ENERGY_S4_DATA[2].name}
                            style={{ width: '100%', display: 'block', marginTop: '4px', cursor: 'zoom-in' }}
                            onClick={() => openLogLightbox(2)} />

                        {/* 5. 两列：04 / 05 */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', height: '30vw' }}>
                            {[3, 4].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S4_DATA[di].src} alt={ENERGY_S4_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                                        onClick={() => openLogLightbox(di)} />
                                </div>
                            ))}
                        </div>

                        {/* 6. 全宽：06 */}
                        <img src={ENERGY_S4_DATA[5].src} alt={ENERGY_S4_DATA[5].name}
                            style={{ width: '100%', display: 'block', marginTop: '4px', cursor: 'zoom-in' }}
                            onClick={() => openLogLightbox(5)} />
                    </div>
                    <div
                        ref={logRightOverlayRef}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', cursor: sideCursor }}
                        onClick={() => setLogModalOpen(false)}
                    />
                </div>
            )}

            {/* ── 04 图片灯箱 ── */}
            {logLightboxIdx !== null && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9100, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', zIndex: 1,
                        cursor: logLightboxIdx === 0 ? 'default' : 'w-resize',
                    }} onClick={() => setLogLightboxIdx(i => Math.max(0, (i ?? 0) - 1))} />
                    <div style={{
                        position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', zIndex: 1,
                        cursor: logLightboxIdx === LOG_LIGHTBOX.length - 1 ? 'default' : 'e-resize',
                    }} onClick={() => setLogLightboxIdx(i => Math.min(LOG_LIGHTBOX.length - 1, (i ?? 0) + 1))} />
                    <div style={{ position: 'relative', display: 'inline-block', zIndex: 2 }} onClick={e => e.stopPropagation()}>
                        <img
                            src={ENERGY_S4_DATA[LOG_LIGHTBOX[logLightboxIdx]].src}
                            alt=""
                            style={{ maxWidth: '80vw', maxHeight: '90vh', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
                        />
                    </div>
                    <button onClick={() => setLogLightboxIdx(null)} style={{
                        position: 'absolute', top: '80px', right: '28px',
                        width: '36px', height: '36px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.35)',
                        color: 'white', fontSize: '13px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                    <div style={{
                        position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)',
                        width: '44px', height: '44px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white', fontSize: '22px', pointerEvents: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: logLightboxIdx === 0 ? 0.25 : 1,
                    }}>‹</div>
                    <div style={{
                        position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)',
                        width: '44px', height: '44px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white', fontSize: '22px', pointerEvents: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: logLightboxIdx === LOG_LIGHTBOX.length - 1 ? 0.25 : 1,
                    }}>›</div>
                </div>
            )}

            {/* ── 05 详情弹出层 ── */}
            {visModalOpen && (
                <div className="fixed inset-0 z-[9000] flex">
                    <div
                        ref={visLeftOverlayRef}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', cursor: sideCursor }}
                        onClick={() => setVisModalOpen(false)}
                    />
                    <div style={{ flex: 3, background: '#0a0a0a', overflowY: 'auto', height: '100vh', position: 'relative' }}>
                        <button onClick={() => setVisModalOpen(false)} style={{
                            position: 'sticky', top: 0, zIndex: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                            width: '100%', padding: '12px 20px',
                            background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(8px)',
                            border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace',
                            fontSize: '12px', letterSpacing: '0.2em', cursor: 'pointer',
                        }}>ESC · CLOSE ✕</button>

                        {/* 1. Banner 视频 */}
                        <video src={ENERGY_S5_DATA[0].src} autoPlay loop muted playsInline style={{ width: '100%', display: 'block' }} />

                        {/* 2. 文字介绍 */}
                        <div style={{ padding: '52px 48px', textAlign: 'center' }}>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.9, fontWeight: 300, maxWidth: '560px', margin: '0 auto', letterSpacing: '0.02em' }}>
                                主旨展现型材灯具种类繁多，适应场景广泛，商业用途多样性，满足前两项的前提下兼顾一些微艺术性。
                            </p>
                        </div>

                        {/* 3. 全宽：02 */}
                        <img src={ENERGY_S5_DATA[1].src} alt={ENERGY_S5_DATA[1].name}
                            style={{ width: '100%', display: 'block', cursor: 'zoom-in' }}
                            onClick={() => openVisLightbox(1)} />

                        {/* 4. 全宽：03 */}
                        <img src={ENERGY_S5_DATA[2].src} alt={ENERGY_S5_DATA[2].name}
                            style={{ width: '100%', display: 'block', marginTop: '4px', cursor: 'zoom-in' }}
                            onClick={() => openVisLightbox(2)} />

                        {/* 5. 三列：04 / 05 / 06 */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', height: '26vw' }}>
                            {[3, 4, 5].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S5_DATA[di].src} alt={ENERGY_S5_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                                        onClick={() => openVisLightbox(di)} />
                                </div>
                            ))}
                        </div>

                        {/* 6. 两列：07 / 08 */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', height: '30vw' }}>
                            {[6, 7].map(di => (
                                <div key={di} style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <img src={ENERGY_S5_DATA[di].src} alt={ENERGY_S5_DATA[di].name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                                        onClick={() => openVisLightbox(di)} />
                                </div>
                            ))}
                        </div>

                        {/* 7. 全宽：09 */}
                        <img src={ENERGY_S5_DATA[8].src} alt={ENERGY_S5_DATA[8].name}
                            style={{ width: '100%', display: 'block', marginTop: '4px', cursor: 'zoom-in' }}
                            onClick={() => openVisLightbox(8)} />
                    </div>
                    <div
                        ref={visRightOverlayRef}
                        style={{ flex: 1, background: 'rgba(0,0,0,0.5)', cursor: sideCursor }}
                        onClick={() => setVisModalOpen(false)}
                    />
                </div>
            )}

            {/* ── 05 图片灯箱 ── */}
            {visLightboxIdx !== null && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9100, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', zIndex: 1,
                        cursor: visLightboxIdx === 0 ? 'default' : 'w-resize',
                    }} onClick={() => setVisLightboxIdx(i => Math.max(0, (i ?? 0) - 1))} />
                    <div style={{
                        position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', zIndex: 1,
                        cursor: visLightboxIdx === VIS_LIGHTBOX.length - 1 ? 'default' : 'e-resize',
                    }} onClick={() => setVisLightboxIdx(i => Math.min(VIS_LIGHTBOX.length - 1, (i ?? 0) + 1))} />
                    <div style={{ position: 'relative', display: 'inline-block', zIndex: 2 }} onClick={e => e.stopPropagation()}>
                        <img
                            src={ENERGY_S5_DATA[VIS_LIGHTBOX[visLightboxIdx]].src}
                            alt=""
                            style={{ maxWidth: '80vw', maxHeight: '90vh', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
                        />
                    </div>
                    <button onClick={() => setVisLightboxIdx(null)} style={{
                        position: 'absolute', top: '80px', right: '28px',
                        width: '36px', height: '36px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.35)',
                        color: 'white', fontSize: '13px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                    <div style={{
                        position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)',
                        width: '44px', height: '44px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white', fontSize: '22px', pointerEvents: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: visLightboxIdx === 0 ? 0.25 : 1,
                    }}>‹</div>
                    <div style={{
                        position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)',
                        width: '44px', height: '44px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white', fontSize: '22px', pointerEvents: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: visLightboxIdx === VIS_LIGHTBOX.length - 1 ? 0.25 : 1,
                    }}>›</div>
                </div>
            )}

            {/* ── 图片灯箱 ── */}
            {lightboxIdx !== null && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9100, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* 左半屏翻页区（超出图片左边即可激活） */}
                    <div style={{
                        position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', zIndex: 1,
                        cursor: lightboxIdx === 0 ? 'default' : 'w-resize',
                    }} onClick={() => setLightboxIdx(i => Math.max(0, (i ?? 0) - 1))} />
                    {/* 右半屏翻页区（超出图片右边即可激活） */}
                    <div style={{
                        position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', zIndex: 1,
                        cursor: lightboxIdx === ENERGY_LIGHTBOX.length - 1 ? 'default' : 'e-resize',
                    }} onClick={() => setLightboxIdx(i => Math.min(ENERGY_LIGHTBOX.length - 1, (i ?? 0) + 1))} />
                    {/* 图片容器（z-index 2，内部点击不冒泡至翻页区） */}
                    <div style={{ position: 'relative', display: 'inline-block', zIndex: 2 }} onClick={e => e.stopPropagation()}>
                        <img
                            src={ENERGY_S1_DATA[ENERGY_LIGHTBOX[lightboxIdx]].src}
                            alt=""
                            style={{ maxWidth: '80vw', maxHeight: '90vh', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
                        />
                    </div>
                    <button onClick={() => setLightboxIdx(null)} style={{
                        position: 'absolute', top: '80px', right: '28px',
                        width: '36px', height: '36px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(20,20,20,0.9)', border: '1px solid rgba(255,255,255,0.35)',
                        color: 'white', fontSize: '13px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                    {/* 左导航圆形按钮（视觉指示，点击由翻页区处理） */}
                    <div style={{
                        position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)',
                        width: '44px', height: '44px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white', fontSize: '22px', pointerEvents: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: lightboxIdx === 0 ? 0.25 : 1,
                    }}>‹</div>
                    {/* 右导航圆形按钮（视觉指示，点击由翻页区处理） */}
                    <div style={{
                        position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)',
                        width: '44px', height: '44px', borderRadius: '50%', zIndex: 3,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white', fontSize: '22px', pointerEvents: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: lightboxIdx === ENERGY_LIGHTBOX.length - 1 ? 0.25 : 1,
                    }}>›</div>
                </div>
            )}
        </div>
    );
};

// --- Shaders for WORK Tunnel ---

const tunnelVertexShader = `
    uniform float uTime;
    uniform float uScroll;
    uniform float uSpread;
    uniform float uRowSpeed;
    uniform float uLetterScale;
    uniform float uRowIndex;
    uniform float uGap;
    uniform float uTotalInstances;
    uniform float uDepthOffset;

    attribute float aIndex;

    varying vec2 vUv;
    varying float vOpacity;

    void main() {
        vUv = uv;

        // Scale letter geometry
        vec3 scaledPos = position * uLetterScale;

        float spacing = 1.8 * uLetterScale;
        float totalInstances = uTotalInstances;
        float halfInstances = totalInstances * 0.5;

        // SPLIT: 0-9 go LEFT, 10-19 go RIGHT
        float isRight = step(halfInstances, aIndex);
        float direction = isRight * 2.0 - 1.0;
        float localIndex = aIndex - isRight * halfInstances;

        // Spread: uniform spacing, scales with mask
        float baseX = direction * (localIndex + 0.5) * spacing * uSpread;

        // Gentle drift — scaled by uSpread so it fades to zero on close
        float scrollOffset = -uScroll * 2.0 * uRowSpeed * uLetterScale * uSpread;
        float currentX = baseX + scrollOffset;

        // No wrapping — just 20 real letters

        // FISHEYE / TUNNEL DEFORMATION
        float spreadExtent = halfInstances * spacing;
        float distFromCenter = abs(currentX);
        float maxDist = spreadExtent;
        float normalizedDist = clamp(distFromCenter / maxDist, 0.0, 1.0);

        float zCurve = pow(normalizedDist, 2.0) * 9.0;

        // Compute Y from row index: letterHeight * scale + fixed gap
        float letterH = 2.18;
        float centerToCenter = (letterH + uGap) * uLetterScale;
        float numRows = 4.0;
        float rowY = (uRowIndex - (numRows - 1.0) * 0.5) * -centerToCenter;

        // Build instance position with computed Y
        vec4 instancePos = vec4(scaledPos, 1.0);
        instancePos.y += rowY;
        instancePos.x += currentX;
        instancePos.z += zCurve + uDepthOffset;

        // Stretch Y at edges
        instancePos.y *= (0.85 + normalizedDist * 0.8);

        vOpacity = 1.0;
        float edgeFade = smoothstep(maxDist, maxDist * 0.65, distFromCenter);
        vOpacity *= edgeFade;

        gl_Position = projectionMatrix * viewMatrix * instancePos;
    }
`;

const tunnelFragmentShader = `
    uniform sampler2D uTexture;
    uniform vec3 uTint;
    varying vec2 vUv;
    varying float vOpacity;

    void main() {
        vec4 color = texture2D(uTexture, vUv);
        if (color.a < 0.1) discard;
        gl_FragColor = vec4(color.rgb * uTint, color.a * vOpacity);
    }
`;


/**
 * Personal Page (Mask-Perspective Tunnel)
 */
const PersonalPage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const pillRef = useRef<SVGRectElement>(null);
    const borderRef = useRef<SVGRectElement>(null);
    const gridHoleRef = useRef<SVGRectElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    // Responsive scale: 1.0 at reference viewport (2560px = 4K@150%), shrinks on smaller screens
    const cardScaleRef = useRef(typeof window !== 'undefined' ? Math.min(1.0, window.innerWidth / 2560) : 1.0);
    const [cardScale, setCardScale] = useState(cardScaleRef.current);

    useEffect(() => {
        if (!containerRef.current || !canvasRef.current || !pillRef.current || !overlayCanvasRef.current) return;

        // --- 1. Three.js Setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000); // Black, matching grid lines

        // Perspective Camera
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 15;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: false
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // --- Overlay Renderer: W + K rows on top of portfolio ---
        const overlayRenderer = new THREE.WebGLRenderer({
            canvas: overlayCanvasRef.current,
            antialias: true,
            alpha: true,
        });
        overlayRenderer.setSize(window.innerWidth, window.innerHeight);
        overlayRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        overlayRenderer.setClearColor(0x000000, 0);

        // --- 2. Create White Dot Grid Background (fixed, evenly spaced) ---
        const dotsGeometry = new THREE.BufferGeometry();
        const dotSpacing = 0.6;
        const gridCountX = 80;
        const gridCountY = 50;
        const dotPositions: number[] = [];
        for (let ix = 0; ix < gridCountX; ix++) {
            for (let iy = 0; iy < gridCountY; iy++) {
                const x = (ix - gridCountX / 2) * dotSpacing;
                const y = (iy - gridCountY / 2) * dotSpacing;
                dotPositions.push(x, y, -5); // Fixed Z behind letters
            }
        }
        dotsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dotPositions), 3));
        const dotsMaterial = new THREE.PointsMaterial({
            size: 0.04,
            color: 0xffffff, // White dots
        });
        const dotsMesh = new THREE.Points(dotsGeometry, dotsMaterial);
        scene.add(dotsMesh);


        // --- 3. Construct "WORK" Tunnel ---
        const letters = ['L', 'A', 'B', 'S'];
        const rows = letters.length;
        const instanceCounts = [20, 24, 22, 22];
        const rowSpeeds = [1.0, 1.6, 1.45, 1.0];

        // Per-letter 3D extrusion config: 1 layer each, different depth, uniform dark gray
        const sideColor = [0.15, 0.15, 0.15];
        const depthConfigs = [
            { depth: 0.12 }, // W
            { depth: 0.18 }, // O
            { depth: 0.08 }, // R
            { depth: 0.15 }, // K
        ];

        const meshes: THREE.InstancedMesh[] = [];

        const createRowMesh = (
            char: string, rowIndex: number, count: number,
            depthOffset: number, tint: number[]
        ) => {
            const geo = new THREE.PlaneGeometry(1.2, 2.18);
            const indices = new Float32Array(count);
            for (let i = 0; i < count; i++) indices[i] = i;
            geo.setAttribute('aIndex', new THREE.InstancedBufferAttribute(indices, 1));

            const texture = createLetterTexture(char);

            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTexture: { value: texture },
                    uTime: { value: 0 },
                    uScroll: { value: 0 },
                    uSpread: { value: 0 },
                    uRowSpeed: { value: rowSpeeds[rowIndex] },
                    uLetterScale: { value: 1.0 },
                    uRowIndex: { value: rowIndex },
                    uGap: { value: -0.60 },
                    uTotalInstances: { value: count },
                    uDepthOffset: { value: depthOffset },
                    uTint: { value: new THREE.Vector3(tint[0], tint[1], tint[2]) },
                },
                vertexShader: tunnelVertexShader,
                fragmentShader: tunnelFragmentShader,
                transparent: true,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.InstancedMesh(geo, material, count);
            const dummy = new THREE.Object3D();
            for (let i = 0; i < count; i++) {
                dummy.position.set(0, 0, 0);
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            }
            mesh.instanceMatrix.needsUpdate = true;
            scene.add(mesh);
            meshes.push(mesh);
        };

        letters.forEach((char, rowIndex) => {
            const count = instanceCounts[rowIndex];
            const cfg = depthConfigs[rowIndex];

            // Single depth layer behind — dark gray
            createRowMesh(char, rowIndex, count, -cfg.depth, sideColor);

            // Front face — white
            createRowMesh(char, rowIndex, count, 0, [1, 1, 1]);
        });

        // --- Overlay Scene: only W[9], W[13], K[12] on top of portfolio ---
        const overlayScene = new THREE.Scene(); // transparent, no background
        const overlayMeshes: THREE.InstancedMesh[] = [];

        const createOverlayInstance = (
            char: string, rowIndex: number, aIdx: number,
            depthOffset: number, tint: number[]
        ) => {
            const geo = new THREE.PlaneGeometry(1.2, 2.18);
            // Single instance with the specific aIndex so shader places it correctly
            geo.setAttribute('aIndex', new THREE.InstancedBufferAttribute(new Float32Array([aIdx]), 1));

            const texture = createLetterTexture(char);
            const mat = new THREE.ShaderMaterial({
                uniforms: {
                    uTexture:        { value: texture },
                    uTime:           { value: 0 },
                    uScroll:         { value: 0 },
                    uSpread:         { value: 0 },
                    uRowSpeed:       { value: rowSpeeds[rowIndex] },
                    uLetterScale:    { value: 1.0 },
                    uRowIndex:       { value: rowIndex },
                    uGap:            { value: -0.60 },
                    uTotalInstances: { value: instanceCounts[rowIndex] }, // full count for correct halfInstances
                    uDepthOffset:    { value: depthOffset },
                    uTint:           { value: new THREE.Vector3(tint[0], tint[1], tint[2]) },
                },
                vertexShader: tunnelVertexShader,
                fragmentShader: tunnelFragmentShader,
                transparent: true,
                side: THREE.DoubleSide,
            });
            const mesh = new THREE.InstancedMesh(geo, mat, 1);
            const dummy = new THREE.Object3D();
            dummy.updateMatrix();
            mesh.setMatrixAt(0, dummy.matrix);
            mesh.instanceMatrix.needsUpdate = true;
            overlayScene.add(mesh);
            overlayMeshes.push(mesh);
        };

        // W row (rowIndex=0, depth=0.12): shadow + front face for each instance
        createOverlayInstance('L', 0, 0,  -0.12, [0.15, 0.15, 0.15]);
        createOverlayInstance('L', 0, 0,   0,    [1, 1, 1]);
        createOverlayInstance('L', 0, 9,  -0.12, [0.15, 0.15, 0.15]);
        createOverlayInstance('L', 0, 9,   0,    [1, 1, 1]);
        createOverlayInstance('L', 0, 12, -0.12, [0.15, 0.15, 0.15]);
        createOverlayInstance('L', 0, 12,  0,    [1, 1, 1]);
        // S row (rowIndex=3, depth=0.15): shadow + front face
        createOverlayInstance('S', 3, 12, -0.15, [0.15, 0.15, 0.15]);
        createOverlayInstance('S', 3, 12,  0,    [1, 1, 1]);


        // --- 4. Animation / Scroll Logic ---
        
        // Grid: 12 cols × 10 rows filling the viewport
        // Pill + stroke = 1.5 cells wide, stroke = 0.2 cells wide
        const getCellSize = () => ({
            cellW: window.innerWidth / 12,
            cellH: window.innerHeight / 10
        });

        const getPillSize = () => {
            const { cellW, cellH } = getCellSize();
            const strokeW = 2;              // Same as grid line thickness (2px)
            const gapW = cellW * 0.1;       // White gap width = 0.1 cells
            const gapH = cellH * 0.1;       // White gap height = 0.1 cells

            // Total height = 8 cells exactly
            // borderH + strokeW = 8 * cellH (stroke centered adds strokeW/2 each side)
            const borderH = cellH * 8 - strokeW;
            const borderW = cellW * 1.5 - strokeW;
            const borderRx = borderW / 2;

            // Inner pill = border inner edge minus gap on each side
            const pillW = borderW - strokeW - gapW * 2;
            const pillH = borderH - strokeW - gapH * 2;
            const pillRx = pillW / 2;

            return { pillW, pillH, pillRx, borderW, borderH, borderRx, strokeW };
        };

        const updateSVG = () => {
             if (overlayRef.current) {
                 const svg = overlayRef.current.querySelector('svg');
                 if (svg) svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
             }
             const { pillW, pillH, pillRx, borderW, borderH, borderRx, strokeW } = getPillSize();
             // Center the pill mask hole (smaller, black interior)
             if (pillRef.current) {
                 pillRef.current.setAttribute('x', String(window.innerWidth / 2 - pillW / 2));
                 pillRef.current.setAttribute('y', String(window.innerHeight / 2 - pillH / 2));
                 pillRef.current.setAttribute('width', String(pillW));
                 pillRef.current.setAttribute('height', String(pillH));
                 pillRef.current.setAttribute('rx', String(pillRx));
             }
             // Border outline (larger rect, black stroke, white gap visible between)
             if (borderRef.current) {
                 borderRef.current.setAttribute('x', String(window.innerWidth / 2 - borderW / 2));
                 borderRef.current.setAttribute('y', String(window.innerHeight / 2 - borderH / 2));
                 borderRef.current.setAttribute('width', String(borderW));
                 borderRef.current.setAttribute('height', String(borderH));
                 borderRef.current.setAttribute('rx', String(borderRx));
                 borderRef.current.setAttribute('stroke-width', String(strokeW));
             }
             // Grid hole = border outer edge (hides grid lines in the gap area)
             if (gridHoleRef.current) {
                 const ghW = borderW + strokeW;
                 const ghH = borderH + strokeW;
                 const ghRx = ghW / 2;
                 gridHoleRef.current.setAttribute('x', String(window.innerWidth / 2 - ghW / 2));
                 gridHoleRef.current.setAttribute('y', String(window.innerHeight / 2 - ghH / 2));
                 gridHoleRef.current.setAttribute('width', String(ghW));
                 gridHoleRef.current.setAttribute('height', String(ghH));
                 gridHoleRef.current.setAttribute('rx', String(ghRx));
             }
             // Update grid pattern to match 12×10 cell size
             const { cellW, cellH } = getCellSize();
             const gridPattern = overlayRef.current?.querySelector('#gridPattern');
             if (gridPattern) {
                 gridPattern.setAttribute('width', String(cellW));
                 gridPattern.setAttribute('height', String(cellH));
                 const gridPath = gridPattern.querySelector('path');
                 if (gridPath) {
                     gridPath.setAttribute('d', `M ${cellW} 0 L 0 0 0 ${cellH}`);
                 }
             }
        };
        updateSVG();
        window.addEventListener('resize', updateSVG);

        const progressObj = {
            scroll: 0,
            spread: 0,
            letterScale: 1.0,
            maskScale: 0,
            portfolioProgress: 0,
        };

        // Store initial pill positions for Phase 3 reverse
        const { pillW, pillH, pillRx, borderW, borderH, borderRx, strokeW } = getPillSize();
        const initPill = {
            x: window.innerWidth / 2 - pillW / 2,
            y: window.innerHeight / 2 - pillH / 2,
            width: pillW, height: pillH, rx: pillRx
        };
        const initBorder = {
            x: window.innerWidth / 2 - borderW / 2,
            y: window.innerHeight / 2 - borderH / 2,
            width: borderW, height: borderH, rx: borderRx
        };
        const ghW = borderW + strokeW;
        const ghH = borderH + strokeW;
        const initGridHole = {
            x: window.innerWidth / 2 - ghW / 2,
            y: window.innerHeight / 2 - ghH / 2,
            width: ghW, height: ghH, rx: ghW / 2
        };

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=900%",
                scrub: 1.5,
                pin: true,
            }
        });

        const finalSize = Math.max(window.innerWidth, window.innerHeight) * 2.5;
        const expandedAttr = {
            x: window.innerWidth / 2 - finalSize / 2,
            y: window.innerHeight / 2 - finalSize / 2,
            width: finalSize,
            height: finalSize,
            rx: finalSize / 2
        };

        // === PHASE 1 (0→1): Open mask + split + scale ===
        tl.to(pillRef.current, { attr: expandedAttr, duration: 1, ease: "power2.inOut" }, 0);

        if (borderRef.current) {
            tl.to(borderRef.current, { attr: expandedAttr, opacity: 0, duration: 1, ease: "power2.inOut" }, 0);
        }
        if (gridHoleRef.current) {
            tl.to(gridHoleRef.current, { attr: expandedAttr, duration: 1, ease: "power2.inOut" }, 0);
        }

        tl.to(progressObj, { spread: 1, ease: "power2.inOut", duration: 1 }, 0);
        tl.to(progressObj, { letterScale: 1.9, ease: "power2.inOut", duration: 1 }, 0);

        // === PHASE 2a (1→5.5): Scroll left — linear ===
        tl.to(progressObj, { scroll: 0.8, ease: "none", duration: 4.5 }, 1);
        // === PHASE 2b (5.5→7): Scroll tail — damping at the very end ===
        tl.to(progressObj, { scroll: 1, ease: "power3.out", duration: 1.5 }, 5.5);
        // === PORTFOLIO (1→7): Drive portfolio gallery across screen ===
        tl.to(progressObj, { portfolioProgress: 1, ease: "none", duration: 6 }, 1);

        // === PHASE 3 (7→8): Close back to initial ===
        tl.to(pillRef.current, { attr: initPill, duration: 1, ease: "power2.inOut" }, 7);

        if (borderRef.current) {
            tl.to(borderRef.current, { attr: initBorder, opacity: 1, duration: 1, ease: "power2.inOut" }, 7);
        }
        if (gridHoleRef.current) {
            tl.to(gridHoleRef.current, { attr: initGridHole, duration: 1, ease: "power2.inOut" }, 7);
        }

        tl.to(progressObj, { spread: 0, ease: "power2.inOut", duration: 1 }, 7);
        tl.to(progressObj, { letterScale: 1.0, ease: "power2.inOut", duration: 1 }, 7);
        tl.to(progressObj, { scroll: 0, ease: "power2.inOut", duration: 1 }, 7);


        // --- 5. Render Loop ---
        const N_CARDS = WORKS_DATA.length;
        // Total span = (N_CARDS-1) gaps + 1 enter + 1 exit = (N_CARDS+1) × T_ENTER ≤ 1.0
        const T_ENTER = 1.0 / (N_CARDS + 1);     // auto-fits all cards in pp [0,1]
        const CARD_SPACING = T_ENTER;             // next card starts when current reaches center → max 2 visible at once
        const T_EXIT  = T_ENTER;                  // leisurely exit, same duration as entry

        const animate = (time: number) => {
            const t = time * 0.001;

            // Update main letter uniforms
            meshes.forEach(mesh => {
                const mat = mesh.material as THREE.ShaderMaterial;
                mat.uniforms.uTime.value = t;
                mat.uniforms.uScroll.value = progressObj.scroll;
                mat.uniforms.uSpread.value = progressObj.spread;
                mat.uniforms.uLetterScale.value = progressObj.letterScale;
            });

            // Update overlay instance uniforms (same values — they're the same row)
            overlayMeshes.forEach(mesh => {
                const mat = mesh.material as THREE.ShaderMaterial;
                mat.uniforms.uTime.value = t;
                mat.uniforms.uScroll.value = progressObj.scroll;
                mat.uniforms.uSpread.value = progressObj.spread;
                mat.uniforms.uLetterScale.value = progressObj.letterScale;
            });

            // Gentle camera float
            camera.position.y = Math.sin(t * 0.5) * 0.2;

            // --- Portfolio: per-card independent timing, max 2 visible at once ---
            const pp = progressObj.portfolioProgress;
            const screenW = window.innerWidth;
            const cardStartX = screenW + 400; // far off-screen right — shadow doesn't bleed in

            cardRefs.current.forEach((card, i) => {
                if (!card) return;

                const cw = Math.round((WORKS_DATA[i]?.cardW ?? 480) * cardScaleRef.current);
                const cardCenterX = screenW / 2 - cw / 2;
                const cardEndX    = -(cw + 400); // far off-screen left

                const enterStartPP = i * CARD_SPACING;
                const exitEndPP    = enterStartPP + T_ENTER + T_EXIT;

                let x: number;
                if (pp <= enterStartPP) {
                    x = cardStartX;
                } else if (pp < exitEndPP) {
                    // Single smooth sinusoidal curve: fast at edges, slow at center, never stops
                    // velocity(t) = 1 + B·cos(2πt)  →  position(t) = t + B·sin(2πt)/(2π)
                    // B=0 → linear; B→1 → very slow center. cardCenterX = exact midpoint ✓
                    const fullT = (pp - enterStartPP) / (T_ENTER + T_EXIT);
                    const B = 0.72;
                    const eased = fullT + B * Math.sin(2 * Math.PI * fullT) / (2 * Math.PI);
                    x = cardStartX + (cardEndX - cardStartX) * eased;
                } else {
                    x = cardEndX;
                }

                // Fisheye scale: center=1.0, screen-edge=1.35
                const cardMidX = x + cw / 2;
                const d = Math.abs(cardMidX - screenW / 2) / (screenW * 0.5);
                const scale = 1.0 + Math.min(d, 1) * 0.35;

                card.style.transform = `translateX(${x}px) scale(${scale})`;
            });

            // --- Overlay: render specific W + K instances on top of portfolio ---
            overlayRenderer.render(overlayScene, camera);

            // Main render
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        const reqId = requestAnimationFrame(animate);

        // --- 6. Resize ---
        const handleResize = () => {
            const newScale = Math.min(1.0, window.innerWidth / 2560);
            cardScaleRef.current = newScale;
            setCardScale(newScale);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            overlayRenderer.setSize(window.innerWidth, window.innerHeight);
            updateSVG();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('resize', updateSVG);
            cancelAnimationFrame(reqId);
            tl.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
            renderer.dispose();
            overlayRenderer.dispose();
            meshes.forEach(m => m.geometry.dispose());
            overlayMeshes.forEach(m => m.geometry.dispose());
        };
    }, []);

    return (
        <div ref={containerRef} id="labs-section" className="relative w-full h-screen bg-black overflow-hidden">
            {/* 1. Underlying WebGL Canvas (The Tunnel) */}
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
            />

            {/* 2. Overlay Mask (Grid Wall) */}
            <div
                ref={overlayRef}
                className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
            >
                <svg className="w-full h-full block">
                    <defs>
                        {/* Mask for pink bg: hole = pill interior */}
                        <mask id="apertureMask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            <rect
                                ref={pillRef}
                                x="0" y="0" width="0" height="0" rx="0"
                                fill="black"
                            />
                        </mask>
                        {/* Mask for grid: hole = border outer edge (hides grid in gap area) */}
                        <mask id="gridMask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            <rect
                                ref={gridHoleRef}
                                x="0" y="0" width="0" height="0" rx="0"
                                fill="black"
                            />
                        </mask>
                        <pattern id="gridPattern" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#000000" strokeWidth="2"/>
                        </pattern>
                    </defs>

                    {/* Light pink background (shows in gap between border and pill) */}
                    <rect
                        x="0" y="0" width="100%" height="100%"
                        fill="#f5e6e0"
                        mask="url(#apertureMask)"
                    />

                    {/* Black grid lines — hidden inside border area (gap + interior) */}
                    <rect
                        x="0" y="0" width="100%" height="100%"
                        fill="url(#gridPattern)"
                        mask="url(#gridMask)"
                    />

                    {/* Black pill border outline */}
                    <rect
                        ref={borderRef}
                        x="0" y="0" width="0" height="0" rx="0"
                        fill="none" stroke="#000000" strokeWidth="0"
                    />
                </svg>
            </div>

            {/* 3. Portfolio Gallery — scrolls right-to-left during WORK phase */}
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{ zIndex: 15 }}
            >
                {WORKS_DATA.map((work, i) => {
                    const cs = cardScale; // shorthand
                    const bw = Math.max(3, Math.round(6 * cs)); // border width scales with card
                    const cardW = Math.round((work.cardW ?? 480) * cs);
                    const topVal = i === 0  ? `calc(50% - ${Math.round(501 * cs)}px)`
                                 : i === 1  ? '20%'
                                 : i === 3  ? `calc(50% - ${Math.round(447 * cs)}px)`
                                 : i === 4  ? `calc(50% - ${Math.round(501 * cs)}px)`
                                 : i === 5  ? `calc(50% - ${Math.round(447 * cs)}px)`
                                 : i === 7  ? `calc(50% - ${Math.round(501 * cs)}px)`
                                 : i === 8  ? `calc(50% - ${Math.round(291 * cs)}px)`
                                 : i === 9  ? `calc(50% - ${Math.round(501 * cs)}px)`
                                 : i === 11 ? '18%'
                                 : i === 12 ? '25%'
                                 : i === 13 ? `calc(50% - ${Math.round(405 * cs)}px)`
                                 : i === 15 ? '15%'
                                 : i === 17 ? '20%'
                                 : i === 20 ? '18%'
                                 : i % 2 === 0 ? '7%' : '48%';
                    return (
                    <div
                        key={work.file}
                        ref={(el: HTMLDivElement | null) => { cardRefs.current[i] = el; }}
                        className="absolute"
                        style={{
                            top: topVal,
                            width: `${cardW}px`,
                            transform: `translateX(${typeof window !== 'undefined' ? window.innerWidth + 400 : 2000}px)`,
                            willChange: 'transform',
                            transformOrigin: 'center center',
                        }}
                    >
                        {/* Card frame — black border top/sides, thick black bottom bar */}
                        <div style={{
                            borderTop: `${bw}px solid #111`,
                            borderLeft: `${bw}px solid #111`,
                            borderRight: `${bw}px solid #111`,
                            borderBottom: 'none',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                            position: 'relative',
                            background: '#000',
                        }}>
                            {/* Content area — exact aspect ratio from source dimensions */}
                            {work.type === 'video' ? (
                                <video
                                    src={`/works/${encodeURIComponent(work.file)}`}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    style={{ width: '100%', aspectRatio: `${work.origW}/${work.origH}`, objectFit: 'cover', display: 'block' }}
                                />
                            ) : (
                                <img
                                    src={`/works/${encodeURIComponent(work.file)}`}
                                    alt={work.name}
                                    style={{ width: '100%', aspectRatio: `${work.origW}/${work.origH}`, objectFit: 'cover', display: 'block' }}
                                />
                            )}
                            {/* Bottom name bar — acts as thick bottom border */}
                            <div style={{
                                background: '#111',
                                borderLeft: `${bw}px solid #111`,
                                borderRight: `${bw}px solid #111`,
                                borderBottom: `${bw}px solid #111`,
                                padding: `${Math.round(6 * cs)}px ${Math.round(10 * cs)}px ${Math.round(8 * cs)}px`,
                                color: '#ffffff',
                                fontFamily: 'monospace',
                                fontSize: `${Math.max(10, Math.round(13 * cs))}px`,
                                fontWeight: 600,
                                letterSpacing: '0.08em',
                                textAlign: 'left',
                            }}>
                                {work.name}
                            </div>
                        </div>
                    </div>
                    );
                })}
            </div>

            {/* 4. W + K letter overlay — on top of portfolio cards */}
            <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ zIndex: 20 }}
            />

        </div>
    );
}

/**
 * Navbar
 */
const Navbar: React.FC = () => {
    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    // 每个按钮独立的 hover 状态 + animKey（key 变化触发动画重播）
    const [hoverMap, setHoverMap] = useState<Record<string, { active: boolean; animKey: number }>>({
        ABOUT: { active: false, animKey: 0 },
        WORK:  { active: false, animKey: 0 },
        LABS:  { active: false, animKey: 0 },
    });

    const handleEnter = (label: string) =>
        setHoverMap(prev => ({ ...prev, [label]: { active: true, animKey: prev[label].animKey + 1 } }));
    const handleLeave = (label: string) =>
        setHoverMap(prev => ({ ...prev, [label]: { ...prev[label], active: false } }));

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-[200] flex items-center border-b border-white/10 bg-black/20 backdrop-blur-sm"
            style={{ height: '78px' }}
        >
            {/* 三角形闪烁动画 keyframes */}
            <style>{`
                @keyframes navTriBlink {
                    0%   { opacity: 0; }
                    14%  { opacity: 0; }  15%  { opacity: 1; }
                    29%  { opacity: 1; }  30%  { opacity: 0; }
                    49%  { opacity: 0; }  50%  { opacity: 1; }
                    64%  { opacity: 1; }  65%  { opacity: 0; }
                    79%  { opacity: 0; }  80%  { opacity: 1; }
                    100% { opacity: 1; }
                }
            `}</style>

            {/* Left: WEILU / Portfolio */}
            <div className="flex-1 px-10 flex flex-col justify-center leading-tight">
                <span className="text-white text-[18px] tracking-[0.25em] uppercase font-medium">WEILU</span>
                <span className="text-white/45 text-[15px] tracking-[0.25em] uppercase font-medium mt-[3px]">Portfolio</span>
            </div>

            {/* Right section: nav links */}
            <div className="flex items-center gap-10 px-10 h-full border-l border-white/10">
                {(['ABOUT', 'WORK', 'LABS'] as const).map(label => {
                    const h = hoverMap[label];
                    return (
                        <button
                            key={label}
                            onClick={() => scrollToSection(
                                label === 'WORK' ? 'commercial-section' :
                                label === 'LABS' ? 'labs-section' : 'about-section'
                            )}
                            onMouseEnter={() => handleEnter(label)}
                            onMouseLeave={() => handleLeave(label)}
                            className="relative text-white/50 hover:text-white transition-colors duration-200 text-xs tracking-[0.25em] font-medium uppercase"
                            style={{ paddingLeft: '10px' }}
                        >
                            {/* 右指三角形：出现时闪烁3次后彻底显示，离开立即消失 */}
                            {h.active && (
                                <span
                                    key={h.animKey}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        display: 'block',
                                        width: 0,
                                        height: 0,
                                        borderTop: '3.5px solid transparent',
                                        borderBottom: '3.5px solid transparent',
                                        borderLeft: '5px solid white',
                                        animation: 'navTriBlink 500ms ease-out forwards',
                                    }}
                                />
                            )}
                            {label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

// ─── About Sphere ─────────────────────────────────────────────────────────────
const AboutSphere: React.FC<{ excludeRef?: React.RefObject<HTMLElement> }> = ({ excludeRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const GAP = 30;
        const MAX_RADIUS = 15;
        const OVERHANG = 200; // extra canvas px on each side so pushed balls never clip
        const ANCHOR_RADIUS = 2;
        const LINE_WIDTH = 1.5;
        const RETURN_SPEED = 0.012;
        const MOUSE_RADIUS = 75;
        const PUSH_FORCE = 4;

        interface SParticle {
            targetX: number; targetY: number;
            x: number; y: number;
            radius: number; color: string;
        }

        let particles: SParticle[] = [];

        const initParticles = () => {
            particles = [];
            const sz = canvas.width - 2 * OVERHANG; // logical container size
            // scx/scy: sphere boundary center — fixed at canvas center.
            // Controls particle grid placement and sphere inclusion. Moving this shifts the whole component.
            const scx = OVERHANG + sz / 2;
            const scy = OVERHANG + sz / 2;
            const R = (sz / 2) * 1.2; // sphere radius 20% larger than container half
            const gcx = scx - sz * 0.05; // 大球左移 5%
            const gcy = scy - sz * 0.15; // 大球上移 15%

            // Exclusion circle: "Wei Lu." text mapped from screen space → canvas space
            // canvas is inside a rotate(-30deg) container, so we apply R(+30°) inverse rotation
            let exCx = -1e6, exCy = -1e6, exR = 0;
            if (excludeRef?.current) {
                const exRect = excludeRef.current.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();
                const dx = (exRect.left + exRect.width / 2) - (canvasRect.left + canvasRect.width / 2);
                const dy = (exRect.top + exRect.height / 2) - (canvasRect.top + canvasRect.height / 2);
                const a = 30 * Math.PI / 180;
                exCx = canvas.width / 2 + dx * Math.cos(a) - dy * Math.sin(a);
                exCy = canvas.height / 2 + dx * Math.sin(a) + dy * Math.cos(a);
                exR = Math.max(exRect.width, exRect.height) / 2;
            }

            const cols = Math.ceil((R * 2) / GAP) + 4;
            const rows = Math.ceil((R * 2) / GAP) + 4;
            const startX = scx - ((cols - 1) * GAP) / 2;
            const startY = scy - ((rows - 1) * GAP) / 2;

            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const px = startX + c * GAP;
                    const py = startY + r * GAP;
                    const ddx = px - scx;
                    const ddy = py - scy;
                    const dist = Math.hypot(ddx, ddy);
                    if (dist > R) continue;
                    if (Math.hypot(px - exCx, py - exCy) < exR) continue;

                    const t = (py - (scy - R)) / (R * 2); // 0=top of sphere, 1=bottom
                    const colorArr: [number, number, number] = t < 0.45
                        ? lerpColor([106, 188, 255], [26, 121, 197], t / 0.45)
                        : lerpColor([26, 121, 197], [39, 39, 39], (t - 0.45) / 0.55);
                    const color = rgbToHex(colorArr);
                    const gdx = px - gcx;
                    const gdy = py - gcy;
                    const gRadius = MAX_RADIUS * Math.max(0, 1 - 0.80 * (Math.hypot(gdx, gdy) / R));
                    const eRadius = MAX_RADIUS * (1 - 0.80 * (dist / R));
                    const radius = Math.min(gRadius, eRadius);
                    particles.push({ targetX: px, targetY: py, x: px, y: py, radius, color });
                }
            }
        };

        const resize = () => {
            const rect = container.getBoundingClientRect();
            const size = Math.round(Math.min(rect.width, rect.height));
            if (size > 0) {
                const total = size + 2 * OVERHANG;
                canvas.width = total;
                canvas.height = total;
                // position canvas so OVERHANG extends beyond container on all sides
                canvas.style.position = 'absolute';
                canvas.style.left = -OVERHANG + 'px';
                canvas.style.top = -OVERHANG + 'px';
                canvas.style.width = total + 'px';
                canvas.style.height = total + 'px';
                initParticles();
            }
        };

        const ro = new ResizeObserver(resize);
        ro.observe(container);
        resize();

        let mouse = { x: -1000, y: -1000 };
        let lastMouse = { x: -1000, y: -1000 };
        let isMouseMoving = false;
        let mouseStopTimer: number | null = null;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            // getBoundingClientRect returns the rotated bounding box.
            // The rotation centre = centre of the bounding box (CSS transform-origin: center).
            const screenCx = rect.left + rect.width  / 2;
            const screenCy = rect.top  + rect.height / 2;
            // Mouse offset from the rotation centre
            const dx = e.clientX - screenCx;
            const dy = e.clientY - screenCy;
            // Un-rotate by +30° to cancel the CSS rotate(-30deg) on the container
            // Inverse of CSS rotate(-30deg) = rotate(+30deg): R(+30)×[dx,dy]
            const a = 30 * Math.PI / 180;
            mouse.x = canvas.width  / 2 + dx * Math.cos(a) - dy * Math.sin(a);
            mouse.y = canvas.height / 2 + dx * Math.sin(a) + dy * Math.cos(a);
            isMouseMoving = true;
            if (mouseStopTimer) clearTimeout(mouseStopTimer);
            mouseStopTimer = window.setTimeout(() => { isMouseMoving = false; }, 50);
        };
        window.addEventListener('mousemove', handleMouseMove);

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const mouseDx = mouse.x - lastMouse.x;
            const mouseDy = mouse.y - lastMouse.y;
            const mouseSpeed = Math.hypot(mouseDx, mouseDy);
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
            ctx.lineWidth = LINE_WIDTH;

            particles.forEach(p => {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.hypot(dx, dy);
                if (isMouseMoving && dist < MOUSE_RADIUS && dist > 0 && mouseSpeed > 0.5) {
                    const nx = -dx / dist;
                    const ny = -dy / dist;
                    const force = PUSH_FORCE * (1 - dist / MOUSE_RADIUS);
                    p.x += nx * force;
                    p.y += ny * force;
                }
                const rdx = p.targetX - p.x;
                const rdy = p.targetY - p.y;
                const rd = Math.hypot(rdx, rdy);
                if (rd > 0.5) {
                    p.x += rdx * RETURN_SPEED;
                    p.y += rdy * RETURN_SPEED;
                } else {
                    p.x = p.targetX;
                    p.y = p.targetY;
                }

                ctx.beginPath();
                ctx.moveTo(p.targetX, p.targetY);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(p.targetX, p.targetY, ANCHOR_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            ro.disconnect();
            cancelAnimationFrame(animationId);
            if (mouseStopTimer) clearTimeout(mouseStopTimer);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', aspectRatio: '1 / 1', position: 'relative', overflow: 'visible', transform: 'rotate(-30deg)' }}
        >
            <canvas ref={canvasRef} style={{ display: 'block' }} />
        </div>
    );
};

/**
 * About Page
 * VERSION A（当前）：左栏含名字+简介，右栏仅履历
 * VERSION B（备用）：左栏仅名字+魏露，右栏含简介+履历
 */
const AboutPage: React.FC = () => {
    const weiluRef = useRef<HTMLHeadingElement>(null);
    return (
        <div
            id="about-section"
            className="relative z-10 w-full bg-black"
            style={{ background: 'linear-gradient(180deg, #000000 0%, #060606 100%)' }}
        >
            {/* Top double rule */}
            <div className="w-full h-px bg-white/25" />
            <div style={{ height: RULE_GAP, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                <BinaryTicker leftArrow="←" rightArrow="→" binLen={30} slashLen={60} reps={13} />
            </div>
            <div className="w-full h-px bg-white/25" />

            {/* Content — always vertically centred in viewport */}
            <div className="w-full flex items-center" style={{ minHeight: '100vh' }}>
            <div className="w-full px-8 md:px-16 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 max-w-7xl mx-auto">
                {/* Left: sphere + name (right-aligned) + bio */}
                <div className="flex flex-col justify-start" style={{ paddingTop: '4rem' }}>
                    {/* Top row: sphere left, name right-aligned */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ flex: '0 0 44%', transform: 'translate(-2rem, -2.5rem) translateY(-20%)' }}>
                            <AboutSphere excludeRef={weiluRef} />
                        </div>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                            <h2 ref={weiluRef} className="font-serif font-bold text-white leading-none"
                                style={{ fontSize: 'clamp(64px, 8vw, 120px)' }}>
                                Wei<br />Lu.
                            </h2>
                        </div>
                    </div>
                    <p className="text-white/30 text-xs tracking-[0.3em] uppercase font-mono mb-8">About</p>
                    <div className="space-y-5 mb-10">
                        <p className="text-white/75 text-base leading-relaxed font-light">
                            我热衷于探索三维视觉在不同领域中的表达。超过 10 年的多行业设计经验，职业生涯跨越了室内建筑设计、线下展会、品牌视觉及数字能源系统。我享受在不同维度的项目中通过三维语言解决视觉问题，并对新技术在实战项目中的生命力保持持续的好奇心。
                        </p>
                        <p className="text-white/50 text-base leading-relaxed font-light">
                            我本科毕业于中国画专业，这种传统艺术根基赋予了我对构图与光影的直觉，并指引我从传统绘画领域跨越至数字化三维创作。在过去十年中，我曾服务于独立设计事务所、进出口公司及互联网交互团队，积累了从物理空间到数字界面的设计经验。
                        </p>
                    </div>
                    <div className="w-full h-px bg-white/10 mb-8" />
                    <p className="text-white/40 text-xs tracking-[0.25em] uppercase font-mono">
                        3D Designer · Shenzhen
                    </p>
                </div>

                {/* Right: career + education + awards */}
                <div className="flex flex-col justify-start space-y-12">
                    {/* Career */}
                    <div>
                        <p className="text-white/30 text-xs tracking-[0.25em] uppercase font-mono mb-6">Career</p>
                        <div className="space-y-8">
                            <div>
                                <p className="text-white/35 text-xs font-mono mb-1">2023 — 至今</p>
                                <p className="text-white text-sm font-medium mb-0.5">
                                    拓维信息 <span className="text-white/40 font-light text-xs">服务于华为数字能源</span>
                                </p>
                                <p className="text-white/40 text-xs font-mono mb-2">三维设计师</p>
                                <p className="text-white/55 text-sm leading-relaxed font-light">
                                    专注于 Web 端与 APP UI里的三维视觉、官网产品详情页、展会宣传视频制作。
                                </p>
                            </div>
                            <div>
                                <p className="text-white/35 text-xs font-mono mb-1">2022 — 2023</p>
                                <p className="text-white text-sm font-medium mb-0.5">合联电子</p>
                                <p className="text-white/40 text-xs font-mono mb-2">设计部主管</p>
                                <p className="text-white/55 text-sm leading-relaxed font-light">
                                    负责产品手册，公司 VI，展会展场设计，品牌视频。
                                </p>
                            </div>
                            <div>
                                <p className="text-white/35 text-xs font-mono mb-1">2013 — 2022</p>
                                <p className="text-white text-sm font-medium mb-0.5">九竹设计</p>
                                <p className="text-white/40 text-xs font-mono mb-2">主案设计师</p>
                                <p className="text-white/55 text-sm leading-relaxed font-light">
                                    负责房产室内装饰设计与线下展会空间设计项目。
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div>
                        <p className="text-white/30 text-xs tracking-[0.25em] uppercase font-mono mb-4">Education</p>
                        <p className="text-white/35 text-xs font-mono mb-1">2007 — 2011</p>
                        <p className="text-white text-sm font-medium mb-0.5">四川成都美术学院</p>
                        <p className="text-white/55 text-sm">学士 · 中国画专业</p>
                    </div>

                    {/* Awards */}
                    <div>
                        <p className="text-white/30 text-xs tracking-[0.25em] uppercase font-mono mb-4">Awards</p>
                        <p className="text-white/35 text-xs font-mono mb-4">参与项目中所有三维元素的制作</p>
                        <div className="space-y-3">
                            {([
                                ['2025', 'Red Dot Award', 'FusionCharge'],
                                ['2023', 'Red Dot Award', 'iManager-M'],
                                ['2024', 'iF Design Award', 'FusionSolar App / Web Platform'],
                                ['2024', 'iF Design Award', 'ZERO Design System'],
                            ] as [string, string, string][]).map(([year, award, project]) => (
                                <div key={project} className="flex items-start gap-3">
                                    <span className="text-white/30 text-xs font-mono w-10 flex-shrink-0" style={{ paddingTop: '6px' }}>{year}</span>
                                    <div>
                                        <span className="text-white/45 text-xs font-mono">{award}: </span>
                                        <span className="text-white text-xs font-mono">{project}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </div>{/* end flex centering wrapper */}

            {/* Bottom double rule */}
            <div className="w-full h-px bg-white/25" />
            <div style={{ height: RULE_GAP, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                <BinaryTicker leftArrow="→" rightArrow="←" binLen={40} slashLen={300} reps={4} />
            </div>
            <div className="w-full h-px bg-white/25" />
        </div>
    );
};

/**
 * Home Page (Fixed Background Layer)
 */
// --- Binary Ticker (参数化) ---
// leftArrow/rightArrow: 两端箭头字符
// padSpaces: 箭头内侧留白（非断行空格数）
// binLen: 每段二进制位数  slashLen: 每段斜杠数  reps: 重复段数
interface _BTProps {
    leftArrow:   string;
    rightArrow:  string;
    padSpaces?:  number;
    binLen:      number;
    slashLen:    number;
    reps:        number;
}
const BinaryTicker: React.FC<_BTProps> = ({
    leftArrow, rightArrow, padSpaces = 4, binLen, slashLen, reps,
}) => {
    const SP   = '\u00A0'.repeat(padSpaces);
    const SLH  = useMemo(() => '/'.repeat(slashLen),  [slashLen]);
    const BIN0 = useMemo(
        () => Array.from({ length: binLen }, (_, i) => (i % 3 !== 0 ? '0' : '1')).join(''),
        [binLen]
    );
    const [segs, setSegs] = useState<string[]>(() =>
        Array.from({ length: reps }, () => BIN0)
    );
    useEffect(() => {
        const id = setInterval(() => {
            setSegs(prev => {
                const next = [...prev];
                for (let j = 0; j < 2; j++) {
                    const si = Math.floor(Math.random() * reps);
                    const bi = Math.floor(Math.random() * binLen);
                    const s  = next[si];
                    next[si] = s.slice(0, bi) + (s[bi] === '0' ? '1' : '0') + s.slice(bi + 1);
                }
                return next;
            });
        }, 80);
        return () => clearInterval(id);
    }, []); // props固定，无需依赖
    return (
        <div style={{
            display: 'flex', alignItems: 'center',
            width: '100%', overflow: 'hidden',
            fontSize: '8px', lineHeight: 1, color: 'rgba(255,255,255,0.8)',
            fontFamily: 'monospace', letterSpacing: '0.4px',
            userSelect: 'none', pointerEvents: 'none',
        }}>
            <span style={{ flexShrink: 0 }}>{SP}{leftArrow}{SP}</span>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <span style={{ whiteSpace: 'nowrap', display: 'block' }}>
                    {segs.map((s, i) => (
                        <React.Fragment key={i}>
                            <span>{s}</span>
                            <span>{SLH}</span>
                        </React.Fragment>
                    ))}
                </span>
            </div>
            <span style={{ flexShrink: 0 }}>{SP}{rightArrow}</span>
        </div>
    );
};

const RULE_GAP      = 24;    // ← 双线内部间距 px（两条线之间的缝隙）
const RULE_PAD_TOP  = '1vw'; // ← 上内线 → 字母顶部距离（vw / px 均可）
const RULE_PAD_BOT  = '0.3vw'; // ← 字母底部 → 下内线距离

const HomePage: React.FC = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const progress = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
            setScrollProgress(progress);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const opacity = Math.max(1 - scrollProgress * 1.6, 0);
    const scale = 1 - scrollProgress * 0.05;

    return (
        <div
            className="fixed top-0 left-0 w-full h-screen z-0 overflow-hidden bg-black"
            style={{ background: 'linear-gradient(180deg, #03111f 0%, #000000 60%)' }}
        >
            {/* ElasticStruct — full screen */}
            <div className="absolute inset-0 z-0">
                <ElasticStruct className="w-full h-full" />
            </div>

            {/* Content layer */}
            <div
                className="absolute inset-0 z-10 flex flex-col pointer-events-none"
                style={{ opacity, transform: `scale(${scale})`, transformOrigin: 'center bottom' }}
            >
                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom: MOTION DESIGNER section — bordered band */}
                <div className="flex-shrink-0">
                    {/* Top double rule */}
                    <div className="w-full h-px bg-white/25" />
                    <div style={{ height: RULE_GAP, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                        <BinaryTicker leftArrow="←" rightArrow="→" binLen={30} slashLen={60} reps={13} />
                    </div>
                    <div className="w-full h-px bg-white/25" />

                   {/* Text — centred */}
                    <div className="px-6" style={{ paddingTop: RULE_PAD_TOP, paddingBottom: RULE_PAD_BOT }}>
                        <div
                            className="flex flex-nowrap items-center justify-center gap-[4vw] w-full select-none"
                            style={{ lineHeight: 0.88 }}
                        >
                            <span
                                className="text-white tracking-tight whitespace-nowrap"
                                style={{
                                    fontFamily: '"Bebas Neue", "Inter", "Arial Black", sans-serif',
                                    fontSize: 'clamp(96px, 17vw, 300px)',
                                    fontWeight: 400,
                                }}
                            >
                                <SlotChar char="M" delay={0} /><SlotChar char="O" fixedDir="left" delay={4000} />T<SlotChar char="I" fixedDir="up" delay={0} />ON
                            </span>
                            {/* 星星：绝对不参与 baseline，独立居中 */}
                            <span
                                className="text-white/25 flex-shrink-0 flex items-center"
                                style={{ fontSize: 'clamp(28px, 4vw, 72px)', lineHeight: 1 }}
                            >
                                ✦
                            </span>
                            <span
                                className="text-white tracking-tight whitespace-nowrap"
                                style={{
                                    fontFamily: '"Bebas Neue", "Inter", "Arial Black", sans-serif',
                                    fontSize: 'clamp(96px, 17vw, 300px)',
                                    fontWeight: 400,
                                }}
                            >
                                <SlotChar char="D" fixedDir="left" delay={7000} /><SlotChar char="E" delay={1500} />S<SlotChar char="I" delay={0} />G<SlotChar char="N" delay={5500} />E<SlotChar char="R" fixedDir="up" sequel="left" delay={8500} />
                            </span>
                        </div>
                    </div>

                    {/* Bottom double rule */}
                    <div className="w-full h-px bg-white/25" />
                    <div style={{ height: RULE_GAP, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                        <BinaryTicker leftArrow="→" rightArrow="←" binLen={40} slashLen={300} reps={4} />
                    </div>
                    <div className="w-full h-px bg-white/25" />
                </div>
            </div>
        </div>
    );
};

const BackToTopFooter: React.FC = () => {
    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="relative z-30 w-full bg-black">
            <button
                onClick={handleClick}
                className="w-full h-20 bg-[#f5e6e0] hover:bg-white text-black transition-colors flex items-center justify-center space-x-3 group"
            >
                <span className="text-2xl font-sans font-bold uppercase tracking-widest">Back to Top</span>
                <svg className="w-5 h-5 transform group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <div className="bg-black text-white min-h-screen font-sans">
            <SmoothCursor />
            <Navbar />
            <HomePage />
            <div className="relative w-full">
                <div className="mt-[100vh]">
                    <AboutPage />
                    <CommercialPage />
                    {/* WORK → LABS divider */}
                    <div className="relative z-10 w-full bg-black">
                        <div className="w-full h-px bg-white/25" />
                        <div style={{ height: RULE_GAP, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                            <BinaryTicker leftArrow="←" rightArrow="→" binLen={30} slashLen={60} reps={13} />
                        </div>
                        <div className="w-full h-px bg-white/25" />
                    </div>
                    <PersonalPage />
                    <BackToTopFooter />
                </div>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);