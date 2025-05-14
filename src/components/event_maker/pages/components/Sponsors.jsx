import React from 'react';
import PropTypes from 'prop-types';
import { FaGlobe } from 'react-icons/fa';

/**
 * Sponsors component for displaying sponsor information from provided data
 */
export function SponsorsComponent({
    sponsors = [],
    levels = [],
    display_sponsor_level = false,
    display_sponsor_website = false,
    display_sponsor_description = false
}) {
  // Use provided sponsors and levels or fallback to example data for preview
  const displaySponsors = Array.isArray(sponsors) && sponsors.length > 0 ? sponsors : [
    {
      id: 1,
      name: "Example Sponsor",
      logo_url: "https://placehold.co/300x200?text=Sponsor+1",
      website_url: "https://example.com",
      level_id: 1,
      description: "This is a gold sponsor"
    },
    {
      id: 2,
      name: "Another Sponsor",
      logo_url: "https://placehold.co/300x200?text=Sponsor+2",
      website_url: "https://example.org",
      level_id: 1,
      description: "Another gold sponsor"
    },
    {
      id: 3,
      name: "Silver Sponsor 1",
      logo_url: "https://placehold.co/300x200?text=Sponsor+3",
      website_url: "https://example.net",
      level_id: 2,
      description: "A silver tier sponsor"
    },
    {
      id: 4,
      name: "Silver Sponsor 2",
      logo_url: "https://placehold.co/300x200?text=Sponsor+4",
      website_url: "https://example.com",
      level_id: 2,
      description: "Another silver sponsor"
    },
    {
      id: 5,
      name: "Silver Sponsor 3",
      logo_url: "https://placehold.co/300x200?text=Sponsor+5",
      website_url: "https://example.org",
      level_id: 2,
      description: "A third silver sponsor"
    }
  ];

  const displayLevels = Array.isArray(levels) && levels.length > 0 ? levels : [
    {
      id: 1,
      name: "Gold"
    },
    {
      id: 2,
      name: "Silver"
    }
  ];

  // Group sponsors by level
  const sponsorsByLevel = displayLevels.map(level => ({
    ...level,
    sponsors: displaySponsors.filter(sponsor => sponsor.level_id === level.id)
  }));

  return (
    <div className="sponsors-component w-full py-6">
      <div className="container mx-auto px-4">
        {display_sponsor_level ? (
          // Display with level sections
          <div className="space-y-16">
            {/* Map through each level and display sponsors within that level */}
            {sponsorsByLevel.map(level => (
              <div key={level.id} className="sponsor-level text-center">
                <h2 className="text-3xl font-bold mb-10 uppercase tracking-wider">{level.name} Sponsors</h2>
                {level.sponsors.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-10 justify-items-center">
                    {level.sponsors.map(sponsor => (
                      <SponsorLogo
                        key={sponsor.id}
                        name={sponsor.name}
                        logo={sponsor.logo_url}
                        website={sponsor.website_url}
                        description={sponsor.description}
                        display_sponsor_description={display_sponsor_description}
                        display_sponsor_website={display_sponsor_website}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No sponsors in this level</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Simple display without level sections
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-10">Our Sponsors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 justify-items-center">
              {displaySponsors.map(sponsor => (
                <SponsorLogo
                  key={sponsor.id}
                  name={sponsor.name}
                  logo={sponsor.logo_url}
                  website={sponsor.website_url}
                  description={sponsor.description}
                  display_sponsor_description={display_sponsor_description}
                  display_sponsor_website={display_sponsor_website}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Simplified sponsor logo display
 */
function SponsorLogo({
  name,
  logo,
  website,
  description,
  display_sponsor_description,
  display_sponsor_website
}) {
  // If we need to display description, use card layout
  if (display_sponsor_description) {
    return (
      <div className="sponsor-card bg-base-100 rounded-lg shadow-md overflow-hidden w-full max-w-xs">
        <div className="flex items-center justify-center bg-base-200">
          <img 
            src={logo}
            alt={`${name} logo`}
            className="max-w-full object-contain"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2">{name}</h3>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          {display_sponsor_website && website && (
            <a 
              href={website}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary flex items-center gap-1"
            >
              <FaGlobe className="w-3 h-3" />
              Visit Website
            </a>
          )}
        </div>
      </div>
    );
  }
  
  // Simple logo-only display (like in the example image)
  return (
    <div className="sponsor-logo flex items-center justify-center h-24">
      {display_sponsor_website && website ? (
        <a 
          href={website}
          target="_blank" 
          rel="noreferrer"
          className="h-full flex items-center justify-center"
          title={name}
        >
          <img 
            src={logo}
            alt={`${name} logo`}
            className="max-h-full max-w-full object-contain"
          />
        </a>
      ) : (
        <img 
          src={logo}
          alt={`${name} logo`}
          className="max-h-full max-w-full object-contain"
        />
      )}
    </div>
  );
}

SponsorsComponent.propTypes = {
  sponsors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string.isRequired,
      logo_url: PropTypes.string.isRequired,
      website_url: PropTypes.string,
      level_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      description: PropTypes.string
    })
  ),
  levels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string.isRequired
    })
  ),
  display_sponsor_level: PropTypes.bool,
  display_sponsor_website: PropTypes.bool,
  display_sponsor_description: PropTypes.bool
};

SponsorLogo.propTypes = {
  name: PropTypes.string.isRequired,
  logo: PropTypes.string.isRequired,
  website: PropTypes.string,
  description: PropTypes.string,
  display_sponsor_description: PropTypes.bool,
  display_sponsor_website: PropTypes.bool
};

export { SponsorsComponent as Sponsors };