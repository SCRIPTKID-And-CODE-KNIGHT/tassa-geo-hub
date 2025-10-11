import { useEffect } from 'react';

interface AdSenseUnitProps {
  slot?: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
}

export const AdSenseUnit = ({ 
  slot = "auto", 
  format = "auto", 
  responsive = true,
  style = { display: 'block' }
}: AdSenseUnitProps) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="my-4">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-4011906180209758"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
};
