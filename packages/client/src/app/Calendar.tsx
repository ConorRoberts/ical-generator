import clsx from "clsx";
import dayjs from "dayjs";

const Calendar = () => {
  const daysInMonth = dayjs().daysInMonth();
  const currentDay = dayjs().date();

  const weeks: number[][] = [];
  let numWeeks = Math.floor(daysInMonth / 7);
  for (let i = 0; i < numWeeks; i++) {
    weeks.push(Array.from({ length: 7 }).map((_, j) => i * 7 + j + 1));
  }

  if (daysInMonth % 7 > 0) {
    weeks.push(
      Array.from({ length: daysInMonth % 7 }).map(
        (_, j) => numWeeks * 7 + j + 1
      )
    );
    numWeeks++;
  }

  return (
    <div>
      <div className="rounded overflow-hidden divide-y bg-gray-100">
        {weeks.map((days, week) => (
          <div
            key={`cal week ${week}`}
            className="grid grid-cols-7 divide-x rounded-br"
          >
            {days.map((day) => (
              <div
                key={`cal day ${day}`}
                className={clsx(
                  "w-12 h-12 flex items-start justify-start p-1 text-sm",
                  day === currentDay
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-400 bg-white"
                )}
              >
                <p>{day}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
