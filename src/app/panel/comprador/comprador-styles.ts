// Estilos compartidos por los subcomponentes del panel comprador
// (extraídos de panel-comprador.component.ts; la regla :host vive en el componente raíz)
export const COMPRADOR_STYLES = [`
    .font-mono, .font-mono *{font-family:'JetBrains Mono',monospace}
    .dark-console{background:rgba(14,15,18,.92);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);border:1px solid rgba(255,255,255,.12);box-shadow:0 30px 70px -15px rgba(0,0,0,.8),0 0 0 1px rgba(0,0,0,.4)}
    .card-technical{background:#181A1F;border:1px solid rgba(255,255,255,.07);transition:all .22s cubic-bezier(.16,1,.3,1)}
    .card-technical:hover{border-color:rgba(6,182,212,.5);background:#1F2229;transform:translateY(-2px);box-shadow:0 12px 30px -10px rgba(6,182,212,.15)}
    .card-best{background:linear-gradient(180deg,rgba(6,182,212,.15) 0%,rgba(24,26,31,.95) 100%);border:2px solid #06B6D4;box-shadow:0 0 25px rgba(6,182,212,.2)}
    .nav-link.active{background:linear-gradient(90deg,rgba(6,182,212,.18) 0%,rgba(6,182,212,.02) 100%);border-left:3px solid #06B6D4;color:#38BDF8}
    .vin-badge{font-family:'JetBrains Mono',monospace;letter-spacing:.08em;background:rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.12)}
    .plate-badge{font-family:'JetBrains Mono',monospace;letter-spacing:.12em;background:#000;color:#fff;border:1.5px solid rgba(255,255,255,.3);box-shadow:inset 0 0 6px rgba(255,255,255,.1)}
    .animate-fadeIn{animation:fadeIn .25s ease both}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .toast-in{animation:toastIn .4s cubic-bezier(.16,1,.3,1) both}
    @keyframes toastIn{from{opacity:0;transform:translateY(-14px) scale(.98)}to{opacity:1;transform:none}}
    .glass-capsule{background:rgba(23,20,18,.88);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);border:1px solid rgba(255,255,255,.14);box-shadow:0 35px 70px -15px rgba(0,0,0,.65),0 0 0 1px rgba(0,0,0,.3)}
    .payment-card{background:rgba(18,15,13,.75);border:1px solid rgba(255,255,255,.08);transition:all .25s cubic-bezier(.16,1,.3,1)}
    .payment-card:hover{border-color:rgba(245,158,11,.45);background:rgba(25,21,18,.92)}
    .btn-apple-cta{background:#FFFFFF;color:#000000;transition:all .2s cubic-bezier(.16,1,.3,1)}
    .btn-apple-cta:hover{background:#E5E5EA;transform:translateY(-1px);box-shadow:0 12px 30px rgba(0,0,0,.4)}
    .btn-apple-cta:active{transform:scale(.99)}
    .dest-card{background:rgba(18,15,13,.78);border:1px solid rgba(255,255,255,.1);transition:all .25s cubic-bezier(.16,1,.3,1)}
    .dest-card:hover{border-color:rgba(245,158,11,.45);background:rgba(25,21,18,.92);transform:translateY(-2px)}
    .dest-card.active{background:linear-gradient(180deg,rgba(6,182,212,.2) 0%,rgba(18,15,13,.9) 100%);border:2px solid #22D3EE;box-shadow:0 10px 30px -10px rgba(34,211,238,.35)}
    @keyframes dashMove{to{stroke-dashoffset:-40}}
    .route-animated{stroke-dasharray:6 6;animation:dashMove 2s linear infinite}
    .leaflet-tooltip.tip-map{background:rgba(0,0,0,.82);border:1px solid rgba(255,255,255,.15);color:#E7E5E4;font-family:'JetBrains Mono',monospace;font-size:10px;padding:2px 8px;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.5)}
    .leaflet-tooltip.tip-map::before{display:none}
    .leaflet-tile{filter:grayscale(.75) brightness(.5) contrast(1.08)}
`];
