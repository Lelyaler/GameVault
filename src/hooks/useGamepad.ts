import { useState, useEffect, useRef } from 'react';

interface GamepadHandlers {
  onNavigateLeft: () => void;
  onNavigateRight: () => void;
  onSelect: () => void;
  onBack: () => void;
  onToggleStatus: () => void;
  onRandomGame?: () => void;
}

export const useGamepad = (handlers: GamepadHandlers) => {
  const [isConnected, setIsConnected] = useState(false);
  const [gamepadName, setGamepadName] = useState<string>('');
  const lastInputTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const handleConnect = (e: GamepadEvent) => {
      setIsConnected(true);
      const name = e.gamepad.id.replace(/\s*\(.*?\)\s*/g, '').trim() || 'Геймпад';
      setGamepadName(name);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setGamepadName('');
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    const pollGamepad = (now: number) => {
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        const gp = gamepads ? Array.from(gamepads).find((g) => g !== null) : null;

        if (gp) {
          if (!isConnected) {
            setIsConnected(true);
            setGamepadName(gp.id.replace(/\s*\(.*?\)\s*/g, '').trim() || 'Геймпад');
          }

          const cooldown = 200;
          if (now - lastInputTimeRef.current > cooldown) {
            const leftPressed = gp.buttons[14]?.pressed || (gp.axes[0] !== undefined && gp.axes[0] < -0.5);
            const rightPressed = gp.buttons[15]?.pressed || (gp.axes[0] !== undefined && gp.axes[0] > 0.5);

            const selectPressed = gp.buttons[0]?.pressed;
            const backPressed = gp.buttons[1]?.pressed;
            const statusPressed = gp.buttons[2]?.pressed;
            const randomPressed = gp.buttons[3]?.pressed;

            if (leftPressed) {
              handlersRef.current.onNavigateLeft();
              lastInputTimeRef.current = now;
            } else if (rightPressed) {
              handlersRef.current.onNavigateRight();
              lastInputTimeRef.current = now;
            } else if (selectPressed) {
              handlersRef.current.onSelect();
              lastInputTimeRef.current = now;
            } else if (backPressed) {
              handlersRef.current.onBack();
              lastInputTimeRef.current = now;
            } else if (statusPressed) {
              handlersRef.current.onToggleStatus();
              lastInputTimeRef.current = now;
            } else if (randomPressed && handlersRef.current.onRandomGame) {
              handlersRef.current.onRandomGame();
              lastInputTimeRef.current = now;
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(pollGamepad);
    };

    rafRef.current = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isConnected]);

  return { isConnected, gamepadName };
};
