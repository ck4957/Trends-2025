import React from "react";
import { Share2 } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
  hashtags?: string[];
  showLabel?: boolean;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  title,
  url,
  hashtags = ["clickspill", title.replace(/\s+/g, "")],
  showLabel = false,
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedHashtags = hashtags.join(",");

  const shareLinks = {
    x: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${encodedHashtags}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "width=600,height=400");
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
        onClick={() => openShareWindow(shareLinks.facebook)}
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
