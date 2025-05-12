import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { baseUrl } from "../../../../consts";

const fallbackData = {
  title: "Floor Plans",
  description: "",
  className: "",
  floorPlans: [],
  show_selector: true,
  fetchIfEmpty: true
};

const dummyFloorPlans = [
  {
    id: 1,
    name: "Main Hall",
    image: "https://placehold.co/600x400?text=Main+Hall",
    details: "This is the main area with booths, stage, and seating."
  },
  {
    id: 2,
    name: "Workshop Room",
    image: "https://placehold.co/600x400?text=Workshop+Room",
    details: "This room hosts all technical workshops."
  },
  {
    id: 3,
    name: "Exhibition Zone",
    image: "https://placehold.co/600x400?text=Exhibition+Zone",
    details: "Dedicated area for exhibitors and networking."
  }
];

export function FloorPlanComponent({
  title = fallbackData.title,
  description = fallbackData.description,
  className = fallbackData.className,
  floorPlans = fallbackData.floorPlans,
  show_selector = fallbackData.show_selector,
  fetchIfEmpty = fallbackData.fetchIfEmpty
}) {
  const [plans, setPlans] = useState(floorPlans || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(fetchIfEmpty && plans.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fetchIfEmpty || floorPlans.length > 0) return;

    const fetchFloorPlans = async () => {
      try {
        const response = await fetch(`${baseUrl}/floor-plan-plugin/floor_plan`);
        const data = await response.json();
        const resolved = data.map(fp => ({
          ...fp,
          image: fp.image?.startsWith("http") ? fp.image : `${baseUrl}/media/${fp.image}`
        }));
        setPlans(resolved);
      } catch (err) {
        console.error("Failed to fetch floor plans:", err);
        // Use dummy data if fetch fails
        setPlans(dummyFloorPlans);
        setError("Unable to load floor plans from server. Showing example data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFloorPlans();
  }, [floorPlans, fetchIfEmpty]);

  if (loading) {
    return (
      <div className={`bg-base-100 p-8 rounded shadow ${className}`}>
        <span className="loading loading-spinner text-primary mx-auto block"></span>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className={`bg-base-100 p-8 rounded shadow text-center ${className}`}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>{title}</h1>
        <p style={{ fontSize: "16px", color: "gray" }}>No floor plans available.</p>
      </div>
    );
  }

  const selected = plans[selectedIndex];

  return (
    <div className={`pt-16 px-4 lg:pt-0`}>
      <div className={`bg-base-100 rounded-lg shadow-md overflow-hidden ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-base-300">
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>{title}</h1>
          {description && (
            <p style={{ fontSize: "16px", color: "gray", marginTop: "4px" }}>
              {description}
            </p>
          )}
          {error && (
            <p className="text-sm text-warning mt-2">{error}</p>
          )}
        </div>

        {/* Selector (optional) */}
        {show_selector && (
          <div className="w-full px-4 mt-2">
            <div
              className="flex gap-4 overflow-x-auto rounded-lg shadow-sm py-4 px-6 mx-auto"
              style={{
                backgroundColor: "var(--color-secondary)",
                maxWidth: "1024px"
              }}
            >
              {plans.map((fp, i) => (
                <button
                  key={fp.id}
                  onClick={() => setSelectedIndex(i)}
                  className={`flex flex-col items-center justify-between rounded-lg transition-all duration-200 min-w-[120px] p-2 ${
                    i === selectedIndex
                      ? "outline outline-2 outline-[var(--color-accent)]"
                      : "outline outline-1 outline-transparent hover:outline-[var(--color-primary)]"
                  }`}
                  style={{
                    backgroundColor: "transparent"
                  }}
                >
                  <img
                    src={fp.image}
                    alt={`Preview of ${fp.name}`}
                    className="w-28 h-20 object-cover rounded mb-2 bg-gray-200"
                  />
                  <span className="text-base font-semibold text-neutral-800 text-center">
                    {fp.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Floor Plan Display */}
        <div className="p-4 flex flex-col items-center gap-8">
          {(show_selector ? [selected] : plans).map((plan) => (
            <div
              key={plan.id}
              className="bg-base-100 rounded-lg border border-base-300 w-full max-w-4xl overflow-hidden"
            >
              <div className="p-4 border-b border-base-200">
                <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{plan.name}</h2>
              </div>
              <div className="p-4">
                <img
                  src={plan.image}
                  alt={`Floor plan image: ${plan.name}`}
                  className="w-full max-h-[500px] object-contain rounded"
                />
                <p
                  style={{
                    fontSize: "16px",
                    marginTop: "16px",
                    color: "var(--color-content)",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.5"
                  }}
                >
                  {plan.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

FloorPlanComponent.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
  floorPlans: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string.isRequired,
      image: PropTypes.string,
      details: PropTypes.string
    })
  ),
  show_selector: PropTypes.bool,
  fetchIfEmpty: PropTypes.bool
};

export { FloorPlanComponent as FloorPlan };