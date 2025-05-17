import React from "react";
import { Share2 } from "lucide-react";

// Declare FB global for TypeScript
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: any;
  }
}

interface ShareButtonsProps {
  title: string;
  category?: string;
  summary?: string;
  url: string;
  hashtags?: string[];
  showLabel?: boolean;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  title,
  category,
  summary,
  url,
  hashtags = [title.replace(/\s+/g, ""), category || ""],
  showLabel = false,
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary || title);
  const encodedHashtags = hashtags.join(",");

  const shareLinks = {
    x: `https://x.com/intent/tweet?text=${encodedSummary}&url=${encodedUrl}&hashtags=${encodedHashtags}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "width=600,height=400");
  };

  // Facebook share dialog using FB SDK
  const shareFacebook = () => {
    if (typeof window !== "undefined" && window.FB) {
      window.FB.ui(
        {
          method: "share",
          display: "popup",
          href: url,
          hashtag: hashtags[0]
            ? `#${hashtags[0].replace(/\s+/g, "")}`
            : undefined,
        },
        (response: any) => {
          if (response && !response.error_message) {
            console.log("Shared successfully");
          } else {
            console.log("Share was not successful");
          }
        }
      );
    } else {
      // Fallback to URL-based sharing if FB SDK is not loaded
      openShareWindow(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
      );
    }
  };
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {showLabel && (
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">
          Share:
        </span>
      )}
      <button
        onClick={() => openShareWindow(shareLinks.x)}
        className="p-2 text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors"
        aria-label="Share on Twitter"
        title="Share on Twitter"
      >
        {/* <Twitter size={16} /> */}
        <i className="fa-brands fa-x-twitter"></i>{" "}
      </button>
      <button
        onClick={shareFacebook}
        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors"
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <i className="fa-brands fa-facebook"></i>
      </button>
      <button
        onClick={() => openShareWindow(shareLinks.linkedin)}
        className="p-2 text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <i className="fa-brands fa-linkedin"></i>{" "}
      </button>
      <button
        onClick={() => openShareWindow(shareLinks.whatsapp)}
        className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full transition-colors"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
      >
        <i className="fa-brands fa-whatsapp"></i>{" "}
      </button>
      <button
        onClick={copyToClipboard}
        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        aria-label="Copy link"
        title="Copy link"
      >
        <Share2 size={16} />
      </button>
    </div>
  );
};

export default ShareButtons;
