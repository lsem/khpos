function getSampleTechMaps() {
  return [
    {
      name: "Хліб білий",
      tintColor: "rgb(216, 216, 216)",
      startTime: Date.parse("01 Jan 1970 00:00:00 GMT"),
      endTime: Date.parse("01 Jan 1970 09:30:00 GMT"),
      id: 0,
      tasks: [
        {
          id: 0,
          name: "Заміс",
          durationMinutes: 60,
          color: "rgb(200, 200, 200)"
        },
        {
          id: 1,
          name: "Випікання",
          durationMinutes: 510,
          color: "rgb(220, 220, 220)"
        }
      ]
    },
    {
      name: "Хліб чорний",
      tintColor: "rgb(216, 216, 216)",
      startTime: Date.parse("01 Jan 1970 02:00:00 GMT"),
      endTime: Date.parse("01 Jan 1970 04:30:00 GMT"),
      id: 1,
      tasks: [
        {
          id: 2,
          name: "Заміс",
          durationMinutes: 60,
          color: "rgb(200, 200, 200)"
        },
        {
          id: 3,
          name: "Випікання",
          durationMinutes: 90,
          color: "rgb(220, 220, 220)"
        }
      ]
    },
    {
      name: "Хліб фіолетовий",
      tintColor: "rgb(216, 216, 216)",
      startTime: Date.parse("01 Jan 1970 07:00:00 GMT"),
      endTime: Date.parse("01 Jan 1970 10:30:00 GMT"),
      id: 2,
      tasks: [
        {
          id: 4,
          name: "Заміс",
          durationMinutes: 120,
          color: "rgb(200, 200, 200)"
        },
        {
          id: 5,
          name: "Випікання",
          durationMinutes: 90,
          color: "rgb(220, 220, 220)"
        }
      ]
    },
    {
      name: "Батон",
      tintColor: "rgb(216, 216, 216)",
      startTime: Date.parse("01 Jan 1970 09:40:00 GMT"),
      endTime: Date.parse("01 Jan 1970 19:10:00 GMT"),
      id: 3,
      tasks: [
        {
          id: 6,
          name: "Заміс",
          durationMinutes: 60,
          color: "rgb(200, 200, 200)"
        },
        {
          id: 7,
          name: "Випікання",
          durationMinutes: 510,
          color: "rgb(220, 220, 220)"
        }
      ]
    }
  ];
}

function getSampleBadgeColors() {
  return ["rgb(247, 243, 17)","rgb(74, 247, 16)","rgb(247, 15, 189)"]
}

export { getSampleBadgeColors, getSampleTechMaps };
