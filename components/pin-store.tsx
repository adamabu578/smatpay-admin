'use client';

import { useEffect, useState } from 'react';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import URLHelper from '@/lib/urlHelper';
import httpClient from '@/lib/httpClient';

// Define the type for a team member
interface RespArrayObj {
    title: string;
    storeMin: number;
    count: number;
}

// Reusable TeamCard component to avoid code repetition
const PinStore = () => {
    const [data, setData] = useState<RespArrayObj[]>([]);

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        try {
            const response = await httpClient.get(URLHelper.pinStore);
            if (response.status == 'success') {
                console.log('response.data :::', response.data);
                setData(response.data);
                // setChartDate({ start: new Date(response.data.meta.start), end: new Date(response.data.meta.end) });
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Error fetching users:", error.message);
            }
        }
    };

    return (
        <Card className="w-full max-w-sm sm:max-w-md @container/card">
            <CardHeader className="pb-4">
                <CardTitle className="text-md font-semibold">PIN Store</CardTitle>
                <CardDescription className="text-sm text-[#a1a1aa]">{`Quantity of PINs available in our store (not the vendor's store).`}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    {data.map((obj, index) => (
                        <div key={index} className="flex items-center justify-between space-x-4">
                            <div className="flex items-center space-x-3">
                                {/* <Avatar>
                                    <AvatarImage src={'https://'} alt={`${'Network'}'s logo`} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar> */}
                                <div>
                                    <p className="text-base font-medium leading-none">{obj.title}</p>
                                    <p className="text-sm text-[#a1a1aa]">Store minimum: {obj.storeMin}</p>
                                </div>
                            </div>
                            <p className="text-base font-medium leading-none">{obj.count}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default PinStore;