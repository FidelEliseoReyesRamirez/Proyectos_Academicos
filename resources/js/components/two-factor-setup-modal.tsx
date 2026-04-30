import { Form } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Check, Copy, ScanLine } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AlertError from '@/components/alert-error';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { useAppearance } from '@/hooks/use-appearance';
import { useClipboard } from '@/hooks/use-clipboard';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { confirm } from '@/routes/two-factor';

function GridScanIcon() {
    return (
        <div className="mb-3 rounded-2xl border border-[#6B1230]/10 bg-white/55 p-1 shadow-[0_10px_24px_rgba(107,18,48,0.08)] backdrop-blur-sm dark:border-[#D6B96A]/14 dark:bg-white/[0.045] dark:shadow-none">
            <div className="relative overflow-hidden rounded-xl border border-[#6B1230]/10 bg-[#F9EDF0]/65 p-3 dark:border-[#D6B96A]/14 dark:bg-[#351B28]/70">
                <div className="absolute inset-0 grid grid-cols-5 opacity-25">
                    {Array.from({ length: 5 }, (_, i) => (
                        <div
                            key={`col-${i + 1}`}
                            className="border-r border-[#6B1230]/20 last:border-r-0 dark:border-[#D6B96A]/20"
                        />
                    ))}
                </div>

                <div className="absolute inset-0 grid grid-rows-5 opacity-25">
                    {Array.from({ length: 5 }, (_, i) => (
                        <div
                            key={`row-${i + 1}`}
                            className="border-b border-[#6B1230]/20 last:border-b-0 dark:border-[#D6B96A]/20"
                        />
                    ))}
                </div>

                <ScanLine className="relative z-20 size-6 text-[#6B1230] dark:text-[#D4849A]" />
            </div>
        </div>
    );
}

function TwoFactorSetupStep({
    qrCodeSvg,
    manualSetupKey,
    buttonText,
    onNextStep,
    errors,
}: {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    buttonText: string;
    onNextStep: () => void;
    errors: string[];
}) {
    const { resolvedAppearance } = useAppearance();
    const [copiedText, copy] = useClipboard();
    const IconComponent = copiedText === manualSetupKey ? Check : Copy;

    return (
        <>
            {errors?.length ? (
                <AlertError errors={errors} />
            ) : (
                <>
                    <div className="mx-auto flex max-w-md overflow-hidden">
                        <div className="mx-auto aspect-square w-64 rounded-2xl border border-[#6B1230]/12 bg-white/65 p-3 shadow-[0_14px_34px_rgba(107,18,48,0.08)] dark:border-[#D6B96A]/14 dark:bg-white/[0.045] dark:shadow-none">
                            <div className="z-10 flex h-full w-full items-center justify-center rounded-xl bg-white p-4 dark:bg-white">
                                {qrCodeSvg ? (
                                    <div
                                        className="aspect-square w-full rounded-lg bg-white p-2 [&_svg]:size-full"
                                        dangerouslySetInnerHTML={{
                                            __html: qrCodeSvg,
                                        }}
                                        style={{
                                            filter:
                                                resolvedAppearance === 'dark'
                                                    ? 'invert(1) brightness(1.5)'
                                                    : undefined,
                                        }}
                                    />
                                ) : (
                                    <Spinner />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full">
                        <Button
                            className="w-full rounded-xl bg-[#6B1230] px-5 font-bold text-white shadow-[0_10px_24px_rgba(107,18,48,0.16)] transition-all duration-200 hover:-translate-y-px hover:bg-[#4A0D21] hover:shadow-[0_12px_28px_rgba(107,18,48,0.20)] dark:bg-[#D4849A] dark:text-[#2B1620] dark:shadow-none dark:hover:bg-[#E3A1B2]"
                            onClick={onNextStep}
                        >
                            {buttonText}
                        </Button>
                    </div>

                    <div className="relative flex w-full items-center justify-center">
                        <div className="absolute inset-0 top-1/2 h-px w-full bg-[#6B1230]/12 dark:bg-[#D6B96A]/14" />
                        <span className="relative rounded-full bg-[#FAF8F5] px-3 py-1 text-xs font-bold text-[#6E6458] dark:bg-[#2B1620] dark:text-[#A9978D]">
                            o ingresa el código manualmente
                        </span>
                    </div>

                    <div className="flex w-full space-x-2">
                        <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-[#6B1230]/12 bg-white/65 shadow-[0_8px_18px_rgba(107,18,48,0.05)] dark:border-[#D6B96A]/14 dark:bg-white/[0.045] dark:shadow-none">
                            {!manualSetupKey ? (
                                <div className="flex h-full w-full items-center justify-center bg-[#F9EDF0]/65 p-3 dark:bg-[#351B28]/70">
                                    <Spinner />
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        readOnly
                                        value={manualSetupKey}
                                        className="h-full w-full bg-transparent p-3 text-sm font-semibold text-[#24151A] outline-none dark:text-[#F4EEE9]"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => copy(manualSetupKey)}
                                        className="border-l border-[#6B1230]/12 px-3 text-[#6B1230] transition-colors hover:bg-[#F9EDF0] dark:border-[#D6B96A]/14 dark:text-[#D4849A] dark:hover:bg-[#351B28]"
                                        aria-label="Copiar clave de configuración"
                                    >
                                        <IconComponent className="w-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-xs leading-5 text-[#6E6458] dark:text-[#A9978D]">
                        Escanea el código QR con Google Authenticator, Microsoft Authenticator u otra aplicación compatible con TOTP.
                    </p>
                </>
            )}
        </>
    );
}

function TwoFactorVerificationStep({
    onClose,
    onBack,
}: {
    onClose: () => void;
    onBack: () => void;
}) {
    const [code, setCode] = useState<string>('');
    const pinInputContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            pinInputContainerRef.current?.querySelector('input')?.focus();
        }, 0);
    }, []);

    return (
        <Form
            {...confirm.form()}
            onSuccess={() => onClose()}
            resetOnError
            resetOnSuccess
        >
            {({
                processing,
                errors,
            }: {
                processing: boolean;
                errors?: { confirmTwoFactorAuthentication?: { code?: string } };
            }) => (
                <>
                    <div
                        ref={pinInputContainerRef}
                        className="relative w-full space-y-3"
                    >
                        <div className="flex w-full flex-col items-center space-y-3 py-2">
                            <InputOTP
                                id="otp"
                                name="code"
                                maxLength={OTP_MAX_LENGTH}
                                onChange={setCode}
                                disabled={processing}
                                pattern={REGEXP_ONLY_DIGITS}
                            >
                                <InputOTPGroup>
                                    {Array.from(
                                        { length: OTP_MAX_LENGTH },
                                        (_, index) => (
                                            <InputOTPSlot
                                                key={index}
                                                index={index}
                                                className="border-[#6B1230]/12 bg-white/65 text-[#24151A] shadow-[0_8px_18px_rgba(107,18,48,0.05)] dark:border-[#D6B96A]/14 dark:bg-white/[0.045] dark:text-[#F4EEE9] dark:shadow-none"
                                            />
                                        ),
                                    )}
                                </InputOTPGroup>
                            </InputOTP>

                            <InputError
                                message={
                                    errors?.confirmTwoFactorAuthentication?.code
                                }
                            />
                        </div>

                        <div className="flex w-full gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 rounded-xl border-[#6B1230]/14 bg-white/55 font-bold text-[#6B1230] hover:bg-[#F9EDF0] dark:border-[#D6B96A]/14 dark:bg-white/[0.045] dark:text-[#D4849A] dark:hover:bg-[#351B28]"
                                onClick={onBack}
                                disabled={processing}
                            >
                                Volver
                            </Button>

                            <Button
                                type="submit"
                                className="flex-1 rounded-xl bg-[#6B1230] font-bold text-white shadow-[0_10px_24px_rgba(107,18,48,0.16)] transition-all duration-200 hover:-translate-y-px hover:bg-[#4A0D21] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#D4849A] dark:text-[#2B1620] dark:shadow-none dark:hover:bg-[#E3A1B2]"
                                disabled={
                                    processing || code.length < OTP_MAX_LENGTH
                                }
                            >
                                {processing ? 'Confirmando...' : 'Confirmar'}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    clearSetupData: () => void;
    fetchSetupData: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorSetupModal({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    fetchSetupData,
    errors,
}: Props) {
    const [showVerificationStep, setShowVerificationStep] =
        useState<boolean>(false);

    const modalConfig = useMemo<{
        title: string;
        description: string;
        buttonText: string;
    }>(() => {
        if (twoFactorEnabled) {
            return {
                title: 'Autenticación en dos pasos activada',
                description:
                    'La autenticación en dos pasos ya está activa. Escanea el código QR o ingresa la clave manual en tu aplicación de autenticación.',
                buttonText: 'Cerrar',
            };
        }

        if (showVerificationStep) {
            return {
                title: 'Verificar código de autenticación',
                description:
                    'Ingresa el código de 6 dígitos generado por tu aplicación de autenticación.',
                buttonText: 'Continuar',
            };
        }

        return {
            title: 'Activar autenticación en dos pasos',
            description:
                'Para terminar la configuración, escanea el código QR o ingresa la clave manual en tu aplicación de autenticación.',
            buttonText: 'Continuar',
        };
    }, [twoFactorEnabled, showVerificationStep]);

    const resetModalState = useCallback(() => {
        setShowVerificationStep(false);
        clearSetupData();
    }, [clearSetupData]);

    const handleClose = useCallback(() => {
        resetModalState();
        onClose();
    }, [onClose, resetModalState]);

    const handleModalNextStep = useCallback(() => {
        if (requiresConfirmation) {
            setShowVerificationStep(true);

            return;
        }

        handleClose();
    }, [requiresConfirmation, handleClose]);

    const fetchSetupDataRef = useRef(fetchSetupData);

    useEffect(() => {
        fetchSetupDataRef.current = fetchSetupData;
    }, [fetchSetupData]);

    useEffect(() => {
        if (isOpen && !qrCodeSvg) {
            fetchSetupDataRef.current();
        }
    }, [isOpen, qrCodeSvg]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="overflow-hidden rounded-2xl border-[#6B1230]/12 bg-[#FAF8F5] text-[#24151A] shadow-[0_18px_45px_rgba(107,18,48,0.14)] dark:border-[#D6B96A]/14 dark:bg-[#2B1620] dark:text-[#F4EEE9] dark:shadow-[0_18px_45px_rgba(18,7,12,0.38)] sm:max-w-md">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(107,18,48,0.08),transparent_34%),radial-gradient(circle_at_0%_92%,rgba(107,18,48,0.10),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.76),rgba(249,237,240,0.64)_48%,rgba(245,243,239,0.70))] dark:bg-[radial-gradient(circle_at_95%_6%,rgba(212,132,154,0.08),transparent_34%),radial-gradient(circle_at_2%_98%,rgba(184,80,112,0.12),transparent_40%),linear-gradient(135deg,#2B1620_0%,#24121A_48%,#351B28_100%)]"
                />

                <div className="relative z-10">
                    <DialogHeader className="flex items-center justify-center">
                        <GridScanIcon />

                        <DialogTitle className="text-center text-xl font-black text-[#24151A] dark:text-[#F4EEE9]">
                            {modalConfig.title}
                        </DialogTitle>

                        <DialogDescription className="text-center text-sm leading-6 text-[#6E6458] dark:text-[#D7C9C0]">
                            {modalConfig.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-5 flex flex-col items-center space-y-5">
                        {showVerificationStep ? (
                            <TwoFactorVerificationStep
                                onClose={handleClose}
                                onBack={() => setShowVerificationStep(false)}
                            />
                        ) : (
                            <TwoFactorSetupStep
                                qrCodeSvg={qrCodeSvg}
                                manualSetupKey={manualSetupKey}
                                buttonText={modalConfig.buttonText}
                                onNextStep={handleModalNextStep}
                                errors={errors}
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}