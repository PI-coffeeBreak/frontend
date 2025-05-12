import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { baseUrl } from "../../../../consts";

export function FloorPlanComponent({
  title = "Floor Plans",
  description = "",
  className = "",
  floorPlans = [],
  showSelector = true,
  fetchIfEmpty = true
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
        setError("Failed to load floor plans.");
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

  if (error || plans.length === 0) {
    return (
      <div className={`bg-base-100 p-8 rounded shadow text-center ${className}`}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>{title}</h1>
        <p style={{ fontSize: "16px", color: "gray" }}>{error || "No floor plans available."}</p>
      </div>
    );
  }

  const selected = plans[selectedIndex];

  return (
    <div className={`pt-16 px-4 lg:pt-0`}>
      <div
        className={`bg-base-100 rounded-lg shadow-md overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-base-300">
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>{title}</h1>
          {description && (
            <p style={{ fontSize: "16px", color: "gray", marginTop: "4px" }}>
              {description}
            </p>
          )}
        </div>

        {/* Selector */}
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

        {/* Selected Floor Plan Display */}
        <div className="p-4 flex justify-center">
          <div className="bg-base-100 rounded-lg border border-base-300 w-full max-w-4xl overflow-hidden">
            <div className="p-4 border-b border-base-200">
              <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
                {selected.name}
              </h2>
            </div>
            <div className="p-4">
              <img
                src={selected.image}
                alt={`Floor plan image: ${selected.name}`}
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
                {selected.details}
              </p>
            </div>
          </div>
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
  showSelector: PropTypes.bool,
  fetchIfEmpty: PropTypes.bool
};
