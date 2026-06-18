'use client';

import { useEffect } from 'react';
import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  noIndex?: boolean;
}

export default function SEOHead({
  title = 'ForumHub - Modern Community Forum',
  description = 'Join ForumHub, a modern community forum platform. Connect with like-minded individuals, share knowledge, and participate in discussions.',
  keywords = ['forum', 'community', 'discussion', 'social', 'networking'],
  image = '/og-image.png',
  url,
  type = 'website',
  publishedAt,
  modifiedAt,
  author,
  noIndex = false,
}: SEOHeadProps) {
  const fullUrl = url ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://forumhub.com'}${url}` : process.env.NEXT_PUBLIC_SITE_URL;
  const fullImage = image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://forumhub.com'}${image}`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="ForumHub" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
      <meta property="twitter:site" content="@forumhub" />

      {/* Article specific */}
      {type === 'article' && (
        <>
          <meta property="article:published_time" content={publishedAt} />
          <meta property="article:modified_time" content={modifiedAt} />
          {author && <meta property="article:author" content={author} />}
        </>
      )}

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />

      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

      {/* Theme Color */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
    </Head>
  );
}

// Structured Data for different content types
export function StructuredData({ type, data }: { type: string; data: any }) {
  let structuredData: any = null;

  switch (type) {
    case 'Organization':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ForumHub',
        url: process.env.NEXT_PUBLIC_SITE_URL,
        logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
        sameAs: [
          'https://twitter.com/forumhub',
          'https://github.com/forumhub',
        ],
      };
      break;

    case 'WebSite':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'ForumHub',
        url: process.env.NEXT_PUBLIC_SITE_URL,
        description: 'Modern community forum platform',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };
      break;

    case 'Article':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        image: data.image,
        author: {
          '@type': 'Person',
          name: data.author,
        },
        publisher: {
          '@type': 'Organization',
          name: 'ForumHub',
          logo: {
            '@type': 'ImageObject',
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
          },
        },
        datePublished: data.publishedAt,
        dateModified: data.modifiedAt,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url,
        },
      };
      break;

    case 'Profile':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        dateCreated: data.joinedAt,
        mainEntity: {
          '@type': 'Person',
          name: data.displayName,
          username: data.username,
          description: data.bio,
          image: data.avatarUrl,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/users/${data.username}`,
        },
      };
      break;

    case 'BreadcrumbList':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${process.env.NEXT_PUBLIC_SITE_URL}${item.url}`,
        })),
      };
      break;

    case 'FAQPage':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.questions.map((q: any) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      };
      break;

    default:
      structuredData = null;
  }

  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
