function AnimatedBackground() {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                overflow: "hidden",
                pointerEvents: "none",
                zIndex: 0,
                background:
                    "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.08), transparent 35%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.07), transparent 35%)"
            }}
        >
            {/* Soft glowing circles */}
            <div
                style={{
                    position: "absolute",
                    width: "420px",
                    height: "420px",
                    borderRadius: "50%",
                    top: "-180px",
                    left: "-120px",
                    background:
                        "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)",
                    animation: "monitorFloat 8s ease-in-out infinite"
                }}
            />

            <div
                style={{
                    position: "absolute",
                    width: "500px",
                    height: "500px",
                    borderRadius: "50%",
                    right: "-200px",
                    bottom: "-220px",
                    background:
                        "radial-gradient(circle, rgba(16,185,129,0.10), transparent 70%)",
                    animation: "monitorFloatReverse 10s ease-in-out infinite"
                }}
            />

            {/* Grid */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.18,
                    backgroundImage:
                        "linear-gradient(rgba(128,128,128,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.12) 1px, transparent 1px)",
                    backgroundSize: "45px 45px"
                }}
            />

            {/* Animation styles */}
            <style>
                {`
                    @keyframes monitorFloat {
                        0%, 100% {
                            transform: translate(0, 0);
                        }

                        50% {
                            transform: translate(35px, 25px);
                        }
                    }

                    @keyframes monitorFloatReverse {
                        0%, 100% {
                            transform: translate(0, 0);
                        }

                        50% {
                            transform: translate(-30px, -20px);
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default AnimatedBackground;