import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const FallingFlowers = () => {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                fullScreen: {
                    enable: true,
                    zIndex: 9999,
                },
                detectRetina: true,
                background: { color: "transparent" },
                particles: {
                    number: {
                        value: 20,
                        density: {
                            enable: true,
                            area: 1200,
                        },
                    },
                    shape: {
                        type: "image",
                        image: [
                            {
                                src: "/images/cuc.png", // Chỉ giữ lại hình ảnh cuc.png
                                width: 32,
                                height: 32,
                            },
                        ],
                    },
                    size: {
                        value: { min: 20, max: 36 },
                        animation: {
                            enable: true,
                            speed: 2,
                            minimumValue: 16,
                            sync: false,
                        },
                    },
                    opacity: {
                        value: { min: 0.5, max: 0.9 },
                        animation: {
                            enable: true,
                            speed: 1,
                            minimumValue: 0.3,
                            sync: false,
                        },
                    },
                    move: {
                        enable: true,
                        speed: { min: 0.4, max: 1.2 },
                        direction: "none", // vô định
                        random: true,
                        straight: false,
                        outModes: {
                            default: "out",
                        },
                        gravity: {
                            enable: true,
                            acceleration: 0.5, // giả lập rơi
                            maxSpeed: 2,
                        },
                    },
                    rotate: {
                        value: { min: 0, max: 360 },
                        direction: "clockwise", // xoay vòng
                        animation: {
                            enable: true,
                            speed: 3,
                            sync: false,
                        },
                    },
                },
            }}
        />
    );
};

export default FallingFlowers;