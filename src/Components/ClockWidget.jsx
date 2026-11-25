import { useContext } from "react";
import { DateContext } from "../context/DateContext";

function ClockWidget() {
  const { currentDate, currentTime } = useContext(DateContext);

  return (
    <div className="time-date-widget no-print" title="KL University Live Time">
      <p className="time-date-line">📅 <span>Date:</span> {currentDate}</p>
      <p className="time-date-line">⏰ <span>Time:</span> {currentTime}</p>
    </div>
  );
}

export default ClockWidget;
