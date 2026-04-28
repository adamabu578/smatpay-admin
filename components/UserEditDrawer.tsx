"use client"

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import httpClient from "@/lib/httpClient"
import URLHelper from "@/lib/urlHelper"
import { IconCopy } from "@tabler/icons-react"

const JSONFieldEditor = ({ 
    id, 
    label, 
    description, 
    value, 
    onChange 
}: { 
    id: string; 
    label: string; 
    description: string; 
    value: string; 
    onChange: (val: string) => void; 
}) => {
    const [mode, setMode] = React.useState<'edit'|'view'>('edit');
    return (
        <div className="grid gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <Label htmlFor={id} className="font-semibold text-[#ff6a00]">{label}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
                <div className="flex gap-2 xl:mt-0 mt-1">
                    <Button variant="outline" size="sm" onClick={() => setMode(m => m === 'edit' ? 'view' : 'edit')} className="h-7 text-xs px-2">
                        {mode === 'edit' ? 'View Formatted' : 'Edit JSON'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                        navigator.clipboard.writeText(value);
                        toast.success(`Copied ${label} to clipboard!`);
                    }} className="h-7 text-xs gap-1 px-2">
                        <IconCopy className="size-3" /> Copy
                    </Button>
                </div>
            </div>
            {mode === 'edit' ? (
                <Textarea 
                    id={id} 
                    value={value} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)} 
                    className="font-mono text-xs min-h-[140px]" 
                    placeholder="{}" 
                />
            ) : (
                <div className="bg-muted/40 p-3 rounded-md overflow-x-auto border border-border min-h-[140px]">
                    <pre className="text-xs font-mono !bg-transparent !p-0 !m-0">{value || "{}"}</pre>
                </div>
            )}
        </div>
    );
};

export default function UserEditDrawer({ 
    userId, 
    userName, 
    open, 
    onOpenChange 
}: { 
    userId: string | null; 
    userName: string | null; 
    open: boolean; 
    onOpenChange: (open: boolean) => void 
}) {
    const isMobile = useIsMobile();
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    const [commission, setCommission] = React.useState("");
    const [depositCharge, setDepositCharge] = React.useState("");
    const [templates, setTemplates] = React.useState("");
    const [printPaper, setPrintPaper] = React.useState("");
    const [printColor, setPrintColor] = React.useState("");

    const fetchUserDetails = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await httpClient.get(`${URLHelper.user}/${id}`);
            if (response?.data?.data) {
                const user = response.data.data;
                setCommission(user.commission ? JSON.stringify(user.commission, null, 2) : "{}");
                setDepositCharge(user.depositCharge ? JSON.stringify(user.depositCharge, null, 2) : "{}");
                setTemplates(user.templates ? JSON.stringify(user.templates, null, 2) : "{}");
                setPrintPaper(user.printPaper ? JSON.stringify(user.printPaper, null, 2) : "{}");
                setPrintColor(user.printColor || "");
            }
        } catch (error) {
            toast.error("Failed to load user schema details.");
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (open && userId) {
            fetchUserDetails(userId);
        }
    }, [open, userId]);

    const handleSave = async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            const payload = {
                commission: commission ? JSON.parse(commission) : undefined,
                depositCharge: depositCharge ? JSON.parse(depositCharge) : undefined,
                templates: templates ? JSON.parse(templates) : undefined,
                printPaper: printPaper ? JSON.parse(printPaper) : undefined,
                printColor: printColor || undefined
            };

            const response = await httpClient.put(`${URLHelper.user}/${userId}`, payload);
            if (response?.data?.status === 'success') {
                toast.success("User parameters updated successfully.");
                onOpenChange(false);
            } else {
                toast.error(response?.data?.msg || "Update failed.");
            }
        } catch (e: any) {
            toast.error("Invalid JSON format in one of the fields. Please check your syntax.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Drawer direction={isMobile ? "bottom" : "right"} open={open} onOpenChange={onOpenChange}>
            <DrawerContent className={!isMobile ? "w-[600px] right-0 left-auto mt-0" : ""}>
                <DrawerHeader className="gap-1 border-b pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <DrawerTitle>Enterprise Settings: {userName}</DrawerTitle>
                            <DrawerDescription>Configure financial commissions, charges, and output templates.</DrawerDescription>
                        </div>
                    </div>
                </DrawerHeader>

                <div className="flex flex-col gap-6 overflow-y-auto p-6 text-sm h-[calc(100vh-160px)]">
                    {isLoading ? (
                        <div className="flex justify-center py-20 text-muted-foreground">Loading user schema...</div>
                    ) : (
                        <div className="space-y-6">
                            <JSONFieldEditor 
                                id="commission" 
                                label="Commission Strategy" 
                                description="JSON configuration mapping payout percentages per service." 
                                value={commission} 
                                onChange={setCommission} 
                            />
                            
                            <JSONFieldEditor 
                                id="depositCharge" 
                                label="Deposit Capabilities & Limits" 
                                description="Platform deposit constraints (Cash, Squad, SafeHavenMFB)." 
                                value={depositCharge} 
                                onChange={setDepositCharge} 
                            />
                            
                            <JSONFieldEditor 
                                id="templates" 
                                label="Service Overwrite Templates" 
                                description="Custom templates overrides per service type." 
                                value={templates} 
                                onChange={setTemplates} 
                            />
                            
                            <JSONFieldEditor 
                                id="printPaper" 
                                label="Print Dimensions / Paper Configurations" 
                                description="Printer layout structural configurations." 
                                value={printPaper} 
                                onChange={setPrintPaper} 
                            />

                            <div className="grid gap-3">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="printColor" className="font-semibold text-[#ff6a00]">Print Color Strategy</Label>
                                    <Button variant="outline" size="sm" onClick={() => {
                                        navigator.clipboard.writeText(printColor);
                                        toast.success("Copied Print Color to clipboard!");
                                    }} className="h-7 text-xs gap-1 px-2">
                                        <IconCopy className="size-3" /> Copy
                                    </Button>
                                </div>
                                <Input 
                                    id="printColor" 
                                    value={printColor} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrintColor(e.target.value)} 
                                    placeholder="e.g. grayscale, color" 
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DrawerFooter className="border-t flex flex-row justify-end space-x-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                    <Button onClick={handleSave} disabled={isSaving || isLoading} className="bg-[#ff6a00] hover:bg-[#ff6a00]/90">
                        {isSaving ? "Saving..." : "Save Configuration"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
