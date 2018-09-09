const initialState = [
  {
    title: "1",
    tintColor: "rgb(216, 216, 216)",
    durationHours: 2.5,
    startTime: Date.parse("01 Jan 1970 00:30:00 GMT"),
    id: "1"
  },
  {
    title: "2",
    tintColor: "rgb(216, 216, 216)",
    durationHours: 1.5,
    startTime: Date.parse("01 Jan 1970 02:00:00 GMT"),
    id: "2"
  },
  {
    title: "3",
    tintColor: "rgb(216, 216, 216)",
    durationHours: 3.5,
    startTime: Date.parse("01 Jan 1970 01:00:00 GMT"),
    id: "3"
  },
  {
    title: "4",
    tintColor: "rgb(216, 216, 216)",
    durationHours: 0.7,
    startTime: Date.parse("01 Jan 1970 1:30:00 GMT"),
    id: "4"
  },
  {
    title: "5",
    tintColor: "rgb(216, 216, 216)",
    durationHours: 0.7,
    startTime: Date.parse("01 Jan 1970 6:30:00 GMT"),
    id: "5"
  },
  {
    title: "6",
    tintColor: "rgb(216, 216, 216)",
    durationHours: 0.4,
    startTime: Date.parse("01 Jan 1970 7:00:00 GMT"),
    id: "6"
  },
  {
    title: "7",
    tintColor: "rgb(216, 216, 216)",
    durationHours: 1.2,
    startTime: Date.parse("01 Jan 1970 7:35:00 GMT"),
    id: "7"
  },
  {
    title: "8",
    tintColor: "rgb(216, 216, 216)",
    durationHours: 1.2,
    startTime: Date.parse("01 Jan 1970 6:30:00 GMT"),
    id: "8"
  },
  {
    title: "9",
    tintColor: "rgb(216, 216, 216)",
    durationHours: 1.2,
    startTime: Date.parse("01 Jan 1970 7:00:00 GMT"),
    id: "9"
  },
  {
    title: "10",
    tintColor: "rgb(216, 216, 216)",
    durationHours: 1.2,
    startTime: Date.parse("01 Jan 1970 7:30:00 GMT"),
    id: "10"
  },
  {
    // On this example we can see the fact that views are not
    // clipped.
    title: "11",
    tintColor: "rgb(216, 216, 216)",
    durationHours: 4.0,
    startTime: Date.parse("01 Jan 1970 23:00:00 GMT"),
    id: "11"
  }
]

export default function techMapsTimeLine(state = initialState, action) {
  switch (action.type) {
    default:
      return state
  }
}