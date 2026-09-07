function Logo({ size = 24, showText = true, textSize = 16 }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/logo.svg" alt="Monitor X" width={size} height={size} style={{ borderRadius: "6px" }} />
            {showText && (
                <span style={{ fontWeight: 600, fontSize: `${textSize}px` }}>Monitor X</span>
            )}
        </div>
    );
}

export default Logo;