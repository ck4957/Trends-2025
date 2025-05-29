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
  hashtags: customHashtags,
  showLabel = false,
}) => {
  // Format a string as a proper hashtag
  const formatAsHashtag = (text: string): string => {
    if (!text) return "";

    // Remove special characters and spaces, keep alphanumeric
    const cleaned = text
      .replace(/[^\w\s]/gi, "") // Remove special characters
      .replace(/\s+/g, ""); // Remove spaces

    // Ensure it starts with a letter (not a number)
    return cleaned.match(/^[0-9]/) ? `Tag${cleaned}` : cleaned;
  };

  // Generate properly formatted hashtags
  const generateHashtags = (): string[] => {
    const tags: string[] = [];

    // Process category if available
    if (category) {
      // Handle categories with spaces, "and", or hyphens
      const categoryTags = category
        .split(/\s+and\s+|\s+&\s+|[-\s]/) // Split on "and", "&", hyphens, and spaces
        .filter((part) => part.trim().length > 0) // Remove empty parts
        .map((part) => formatAsHashtag(part));

      // tags.push(...categoryTags);
    }

    // Add a hashtag from the title (limit to first few words)
    const titleWords = title.split(/\s+/).slice(0, 3);
    if (titleWords.length > 0) {
      const titleTag = formatAsHashtag(titleWords.join(" "));
      if (titleTag && !tags.includes(titleTag)) {
        tags.push(titleTag);
      }
    }

    // If custom hashtags were provided, add them too (after formatting)
    if (customHashtags && customHashtags.length > 0) {
      const formattedCustomTags = customHashtags
        .map((tag) => formatAsHashtag(tag))
        .filter((tag) => tag && !tags.includes(tag));

      tags.push(...formattedCustomTags);
    }

    // Return unique, non-empty hashtags
    return Array.from(new Set(tags)).filter(Boolean);
  };

  const hashtags = generateHashtags();

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary || "");
  const encodedHashtags = hashtags.join(",");

  const shareLinks = {
    x: `https://x.com/intent/tweet?text=${encodedSummary}&url=${encodedUrl}&hashtags=${encodedHashtags}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const openShareWindow = (url: string) => {
    window.open(
      url,
      "_blank",
      "width=600,height=400,scrollbars=yes,resizable=yes"
    );
  };

  // Facebook share function with improved fallback
  const shareFacebook = () => {
    if (typeof window !== "undefined" && window.FB && window.FB.ui) {
      // Use Facebook SDK if available
      window.FB.ui(
        {
          method: "share",
          display: "popup",
          href: url,
          hashtag: hashtags.length > 0 ? `#${hashtags[0]}` : undefined,
        },
        (response: any) => {
          if (response && !response.error_message) {
            console.log("Facebook share successful");
          } else {
            console.log("Facebook share cancelled or failed");
          }
        }
      );
    } else {
      // Fallback to direct Facebook sharer URL
      openShareWindow(shareLinks.facebook);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // Use a more user-friendly notification
      if (typeof window !== "undefined") {
        // Create a temporary toast notification instead of alert
        const toast = document.createElement("div");
        toast.textContent = "Link copied to clipboard!";
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 12px 24px;
          border-radius: 4px;
          z-index: 1000;
          font-size: 14px;
        `;
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      if (typeof window !== "undefined") {
        prompt("Copy this link:", url);
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {showLabel && (
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">
          Share:
        </span>
      )}

      {/* Twitter/X */}
      <button
        onClick={() => openShareWindow(shareLinks.x)}
        className="p-2 text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors"
        aria-label="Share on Twitter"
        title="Share on Twitter"
      >
        <i className="fa-brands fa-x-twitter text-base"></i>
      </button>

      {/* Facebook */}
      <button
        onClick={shareFacebook}
        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors"
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <i className="fa-brands fa-facebook text-base"></i>
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => openShareWindow(shareLinks.linkedin)}
        className="p-2 text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <i className="fa-brands fa-linkedin text-base"></i>
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => openShareWindow(shareLinks.whatsapp)}
        className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full transition-colors"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
      >
        <i className="fa-brands fa-whatsapp text-base"></i>
      </button>

      {/* Copy Link */}
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
