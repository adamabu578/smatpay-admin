"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { IconArrowLeft, IconCopy, IconLoader2, IconUser, IconMail, IconPhone, IconWallet } from "@tabler/icons-react"
import httpClient from "@/lib/httpClient"
import URLHelper from "@/lib/urlHelper"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const JSONFieldEditor = ({ 
    id, 
    label, 
    description, 
    value, 
    onChange,
    onSave,
    isSaving
}: { 
    id: string; 
    label: string; 
    description: string; 
    value: string; 
    onChange: (val: string) => void;
    onSave: () => void;
    isSaving: boolean;
}) => {
    const [mode, setMode] = React.useState<'edit'|'view'>('view');
    return (
        <div className="grid gap-3 pt-4 border-t first:pt-0 first:border-0">
            <div className="flex justify-between items-start">
                <div>
                    <Label htmlFor={id} className="font-semibold text-[#ff6a00] text-base">{label}</Label>
                    <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                </div>
                <div className="flex gap-2 xl:mt-0 mt-1">
                    <Button variant="outline" size="sm" onClick={() => setMode(m => m === 'edit' ? 'view' : 'edit')} className="h-8 text-xs font-medium">
                        {mode === 'edit' ? 'View Formatted' : 'Edit JSON'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                        navigator.clipboard.writeText(value);
                        toast.success(`Copied ${label} to clipboard!`);
                    }} className="h-8 text-xs gap-1 font-medium">
                        <IconCopy className="size-3.5" /> Copy
                    </Button>
                </div>
            </div>
            {mode === 'edit' ? (
                <div className="space-y-2 mt-1">
                    <Textarea 
                        id={id} 
                        value={value} 
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)} 
                        className="font-mono text-sm min-h-[160px]" 
                        placeholder="{}" 
                    />
                    <div className="flex justify-end">
                        <Button size="sm" onClick={onSave} disabled={isSaving} className="bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white">
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-muted/30 p-4 rounded-md overflow-x-auto border border-border min-h-[100px] mt-1 relative group">
                    <pre className="text-sm font-mono !bg-transparent !p-0 !m-0 text-foreground/80">{value || "{}"}</pre>
                </div>
            )}
        </div>
    );
};

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params as { id: string };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    // Form fields parsing JSON to strings for editing
    const [commission, setCommission] = React.useState("");
    const [depositCharge, setDepositCharge] = React.useState("");
    const [templates, setTemplates] = React.useState("");
    const [printPaper, setPrintPaper] = React.useState("");
    const [printColor, setPrintColor] = React.useState("");

    const fetchUserDetails = async () => {
        setIsLoading(true);
        try {
            const response = await httpClient.get(`${URLHelper.user}/${id}`);
            if (response?.status === 'success' && response?.data) {
                const u = response.data;
                setUser(u);
                setCommission(u.commission ? JSON.stringify(u.commission, null, 4) : "{}");
                setDepositCharge(u.depositCharge ? JSON.stringify(u.depositCharge, null, 4) : "{}");
                setTemplates(u.templates ? JSON.stringify(u.templates, null, 4) : "{}");
                setPrintPaper(u.printPaper ? JSON.stringify(u.printPaper, null, 4) : "{}");
                setPrintColor(u.printColor || "");
            } else {
                toast.error("User not found.");
            }
        } catch (error) {
            toast.error("Failed to load user records.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (id) fetchUserDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleSaveField = async (fieldName: string, valueStr: string) => {
        setIsSaving(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payload: any = {};
            if (fieldName === 'printColor' || fieldName === 'status') {
                payload[fieldName] = valueStr || undefined;
            } else {
                payload[fieldName] = valueStr ? JSON.parse(valueStr) : undefined;
            }

            const response = await httpClient.put(`${URLHelper.user}/${id}`, payload);
            if (response?.status === 'success') {
                toast.success(`${fieldName} updated safely.`);
                fetchUserDetails();
            } else {
                toast.error(response?.message || response?.msg || "Update failed.");
            }
        } catch {
            toast.error("Invalid JSON format. Please verify your brackets and quotes.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 h-full">
                <IconLoader2 className="size-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-sm font-medium">Resolving User Identity...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8 flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
                <Button variant="outline" onClick={() => router.back()}>Return to Directory</Button>
            </div>
        );
    }

    const formatNaira = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 border">
                    <IconArrowLeft className="size-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{user.firstName} {user.lastName}</h1>
                    <div className="text-muted-foreground text-sm flex items-center gap-2 mt-0.5">
                        <IconMail className="size-3.5" /> {user.email}
                        <Separator orientation="vertical" className="h-3" />
                        <IconPhone className="size-3.5" /> {user.phone}
                    </div>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                    <Select value={user.status || 'active'} onValueChange={(val) => handleSaveField('status', val)}>
                        <SelectTrigger className="w-[130px] h-8 bg-transparent">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left Column: Core Identity */}
                <div className="space-y-6 xl:col-span-1">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2"><IconWallet className="size-5 text-muted-foreground" /> Financial View</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Main Balance</p>
                                    <p className="text-xl font-bold">{formatNaira(user.balance)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Commission</p>
                                    <p className="text-xl text-[#ff6a00] font-bold">{formatNaira(user.commissionWallet)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2"><IconUser className="size-5 text-muted-foreground" /> Account Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between items-center py-1 border-b">
                                <span className="text-muted-foreground">Internal ID</span>
                                <span className="font-mono text-xs">{user._id || user.id}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b">
                                <span className="text-muted-foreground">KYC Tier</span>
                                <Badge variant="outline">{user.kyc?.tier || 'Unverified'}</Badge>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b">
                                <span className="text-muted-foreground">BVN</span>
                                <span className="font-mono">{user.kyc?.bvn || 'Not Supplied'}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-muted-foreground">Virtual Accounts</span>
                                <span>{user.virtualAccounts?.length || 0} active</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Enterprise Configuration Editor */}
                <div className="xl:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="pb-4 border-b bg-muted/10">
                            <CardTitle className="text-xl flex items-center justify-between">
                                Enterprise Param Extraction
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Extract nested logic blocks explicitly via the clipboard to inject into other profiles, or format the active schemas directly.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-2">
                            <JSONFieldEditor 
                                id="commission" 
                                label="Commission Framework" 
                                description="Nested arrays explicitly mapping out percentage allocations per provider." 
                                value={commission} 
                                onChange={setCommission}
                                onSave={() => handleSaveField('commission', commission)}
                                isSaving={isSaving} 
                            />
                            
                            <JSONFieldEditor 
                                id="depositCharge" 
                                label="Deposit Configuration" 
                                description="Flat and percentage fees enforced on external gateway processing routes." 
                                value={depositCharge} 
                                onChange={setDepositCharge}
                                onSave={() => handleSaveField('depositCharge', depositCharge)}
                                isSaving={isSaving} 
                            />
                            
                            <JSONFieldEditor 
                                id="templates" 
                                label="Receipt Formatting Overrides" 
                                description="Customized thermal receipt data matrices." 
                                value={templates} 
                                onChange={setTemplates}
                                onSave={() => handleSaveField('templates', templates)}
                                isSaving={isSaving} 
                            />
                            
                            <JSONFieldEditor 
                                id="printPaper" 
                                label="Print Canvas Architecture" 
                                description="Spatial specifications for POS paper distribution frameworks." 
                                value={printPaper} 
                                onChange={setPrintPaper}
                                onSave={() => handleSaveField('printPaper', printPaper)}
                                isSaving={isSaving} 
                            />

                            <div className="grid gap-3 pt-6 border-t mt-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Label htmlFor="printColor" className="font-semibold text-[#ff6a00] text-base">Print Color Scheme</Label>
                                        <p className="text-sm text-muted-foreground mt-0.5">Physical printer payload metadata target.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => {
                                            navigator.clipboard.writeText(printColor);
                                            toast.success("Copied Print Color format string!");
                                        }} className="h-8 text-xs gap-1 px-3">
                                            <IconCopy className="size-3.5" /> Copy String
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Input 
                                        id="printColor" 
                                        value={printColor} 
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrintColor(e.target.value)} 
                                        className="font-mono text-sm max-w-[400px]"
                                        placeholder="e.g. grayscale, color" 
                                    />
                                    <Button size="sm" onClick={() => handleSaveField('printColor', printColor)} disabled={isSaving} className="bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white">
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
