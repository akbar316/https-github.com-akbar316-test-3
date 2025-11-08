import React, { useState, useEffect } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';

interface IpInfo { ip: string; city: string; region: string; country: string; isp: string; }

const IpFinder: React.FC = () => {
    const [info, setInfo] = useState<IpInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call with mock data
        setTimeout(() => {
            setInfo({ip: '8.8.8.8', city: 'Mountain View', region: 'CA', country: 'US', isp: 'Google LLC'});
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <ToolPageLayout
            title="My IP Address Finder"
            description="Find your public IP address and location details."
        >
            <div className="text-center space-y-6">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                         <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                         <span>Loading...</span>
                    </div>
                ) : info ? (
                    <>
                        <p className="text-brand-text-secondary">Your Public IP Address is:</p>
                        <div className="text-4xl font-bold bg-brand-bg p-4 rounded-md text-brand-primary">{info.ip}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                            <InfoCard label="City" value={info.city} />
                            <InfoCard label="Region" value={info.region} />
                            <InfoCard label="Country" value={info.country} />
                            <InfoCard label="ISP" value={info.isp} />
                        </div>
                    </>
                ) : null}
            </div>
        </ToolPageLayout>
    );
};

const InfoCard: React.FC<{label: string, value: string}> = ({label, value}) => (
    <div className="bg-brand-bg p-4 rounded-lg">
        <p className="text-sm text-brand-text-secondary">{label}</p>
        <p className="font-semibold text-lg">{value}</p>
    </div>
);

export default IpFinder;