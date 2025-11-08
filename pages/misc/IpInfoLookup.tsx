import React, { useState } from 'react';
import { ToolPageLayout } from '../../components/ToolPageLayout';

// Updated interface to allow for missing data
interface IpInfo {
    ip: string;
    hostname: string;
    city: string;
    region: string;
    country: string;
    postal: string;
    latitude: number | null;
    longitude: number | null;
    timezone: string;
    isp: string;
    asn: string;
}

const IpInfoLookup: React.FC = () => {
    const [ip, setIp] = useState('8.8.8.8');
    const [info, setInfo] = useState<IpInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const lookup = async () => {
        if (!ip.trim()) {
            setError('Please enter an IP address.');
            return;
        }
        setLoading(true);
        setError('');
        setInfo(null);
        
        // Simulate an API call with mock data
        setTimeout(() => {
            setInfo({
                ip: ip,
                hostname: 'google-public-dns-a.google.com',
                city: 'Mountain View',
                region: 'CA',
                country: 'US',
                postal: '94043',
                latitude: 37.4224,
                longitude: -122.0842,
                timezone: 'America/Los_Angeles',
                isp: 'Google LLC',
                asn: 'AS15169 Google LLC',
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <ToolPageLayout
            title="IP Info Lookup"
            description="Get geolocation information for any IP address."
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex">
                    <input 
                        type="text" 
                        value={ip} 
                        onChange={e => setIp(e.target.value)} 
                        className="w-full p-3 bg-brand-bg border border-brand-border rounded-l-md text-lg" 
                        placeholder="Enter IP Address"
                        disabled={loading} 
                    />
                    <button 
                        onClick={lookup} 
                        disabled={loading}
                        className="bg-brand-primary text-white px-6 rounded-r-md font-semibold hover:bg-brand-primary-hover disabled:bg-gray-500"
                    >
                        {loading ? 'Looking up...' : 'Lookup'}
                    </button>
                </div>

                {error && <p className="text-red-500 text-center">{error}</p>}
                
                {loading && (
                    <div className="flex flex-col justify-center items-center h-64 text-brand-text-secondary">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mb-4"></div>
                        <p>Performing lookup...</p>
                    </div>
                )}

                {info && (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Location Info */}
                            <div className="bg-brand-bg p-4 rounded-lg space-y-2">
                                <h3 className="font-semibold text-brand-primary text-lg">Location</h3>
                                <InfoRow label="IP Address" value={info.ip} />
                                <InfoRow label="City" value={info.city} />
                                <InfoRow label="Region" value={info.region} />
                                <InfoRow label="Country" value={info.country} />
                                <InfoRow label="Postal Code" value={info.postal} />
                            </div>
                            {/* Network Info */}
                            <div className="bg-brand-bg p-4 rounded-lg space-y-2">
                                <h3 className="font-semibold text-brand-primary text-lg">Network</h3>
                                <InfoRow label="Hostname" value={info.hostname} />
                                <InfoRow label="ISP" value={info.isp} />
                                <InfoRow label="ASN" value={info.asn} />
                                <InfoRow label="Timezone" value={info.timezone} />
                            </div>
                        </div>
                        {/* Geolocation */}
                        <div className="bg-brand-bg p-4 rounded-lg">
                            <h3 className="font-semibold text-brand-primary text-lg mb-2">Geolocation</h3>
                            <div className="flex justify-between items-center">
                                <div>
                                    <InfoRow label="Latitude" value={info.latitude !== null ? info.latitude.toString() : 'N/A'} />
                                    <InfoRow label="Longitude" value={info.longitude !== null ? info.longitude.toString() : 'N/A'} />
                                </div>
                                {info.latitude !== null && info.longitude !== null && (
                                    <a
                                        href={`https://www.google.com/maps?q=${info.latitude},${info.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-brand-surface hover:bg-brand-border text-brand-text-primary font-semibold px-4 py-2 rounded-md transition-colors"
                                    >
                                        View on Map
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                 <p className="text-xs text-center text-brand-text-secondary">Note: Geolocation data is for informational purposes only and uses mock data.</p>
            </div>
        </ToolPageLayout>
    );
};

const InfoRow: React.FC<{label: string, value: string}> = ({label, value}) => (
    <div className="flex text-sm">
        <span className="w-28 font-semibold text-brand-text-secondary">{label}:</span>
        <span className="text-brand-text-primary break-all">{value}</span>
    </div>
);

export default IpInfoLookup;