const initialState = [
  {
    startTime: Date.parse("01 Jan 1970 00:30:00 GMT"),
    id: "1",
    techMap: {
      id:"1",
      name:"1",
      tintColor: "rgb(216, 216, 216)",
      tasks: [
        {
          id: "1",
          name: "task 1",
          durationMins: 30,
          bgColor: "rgb(216, 216, 216)"
        },
        {
          id: "2",
          name: "task 2",
          durationMins: 40,
          bgColor: "rgb(200, 200, 200)"
        },
        {
          id: "3",
          name: "task 3",
          durationMins: 60,
          bgColor: "rgb(216, 216, 216)"
        },
        {
          id: "4",
          name: "task 4",
          durationMins: 20,
          bgColor: "rgb(200, 200, 200)"
        },
      ]
    }
  },
  {
    startTime: Date.parse("01 Jan 1970 01:30:00 GMT"),
    id: "2",
    techMap: {
      id:"2",
      name:"2",
      tintColor: "rgb(216, 216, 216)",
      tasks: [
        {
          id: "1",
          name: "task 1",
          durationMins: 30,
          bgColor: "rgb(216, 216, 216)"
        },
        {
          id: "2",
          name: "task 2",
          durationMins: 40,
          bgColor: "rgb(200, 200, 200)"
        },
        {
          id: "3",
          name: "task 3",
          durationMins: 30,
          bgColor: "rgb(216, 216, 216)"
        },
        {
          id: "4",
          name: "task 4",
          durationMins: 20,
          bgColor: "rgb(200, 200, 200)"
        },
      ]
    }
  },
  {
    startTime: Date.parse("01 Jan 1970 03:30:00 GMT"),
    id: "3",
    techMap: {
      id:"3",
      name:"3",
      tintColor: "rgb(216, 216, 216)",
      tasks: [
        {
          id: "1",
          name: "task 1",
          durationMins: 30,
          bgColor: "rgb(216, 216, 216)"
        },
        {
          id: "2",
          name: "task 2",
          durationMins: 10,
          bgColor: "rgb(200, 200, 200)"
        },
        {
          id: "3",
          name: "task 3",
          durationMins: 30,
          bgColor: "rgb(216, 216, 216)"
        },
        {
          id: "4",
          name: "task 4",
          durationMins: 10,
          bgColor: "rgb(200, 200, 200)"
        },
      ]
    }
  }
]

export default function techMapsTimeLine(state = initialState, action) {
  switch (action.type) {
    default:
      return state
  }
}