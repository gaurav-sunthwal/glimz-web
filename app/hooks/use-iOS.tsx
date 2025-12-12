import { useEffect, useState } from "react";

export function useIsIOS() {
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if running in a mobile app context (React Native WebView)
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

        // Detect iOS devices
        const iosDetected = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;

        setIsIOS(iosDetected);
    }, []);

    return isIOS;
}

export function useDeviceOS() {
    const [os, setOS] = useState<'ios' | 'android' | 'web'>('web');

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

        // Detect iOS
        if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
            setOS('ios');
        }
        // Detect Android
        else if (/android/i.test(userAgent)) {
            setOS('android');
        }
        // Otherwise it's web
        else {
            setOS('web');
        }
    }, []);

    return os;
}
