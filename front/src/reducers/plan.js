const initialState = [
  {
  startTime: Date.parse("01 Jan 1970 00:30:00 GMT"),
    id: "1",
    column: 0,
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
          bgColor: "rgb(255, 149, 0)"
        },
      ]
    }
  },
  {
    startTime: Date.parse("01 Jan 1970 01:30:00 GMT"),
    id: "2",
    column: 1,
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
          bgColor: "rgb(255, 149, 0)"
        },
      ]
    }
  },
  {
    startTime: Date.parse("01 Jan 1970 02:30:00 GMT"),
    id: "3",
    column: 2,
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
          bgColor: "rgb(255, 149, 0)"
        },
      ]
    }
  },
  {
    startTime: Date.parse("01 Jan 1970 03:55:00 GMT"),
    id: "4",
    column: 1,
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
          bgColor: "rgb(255, 149, 0)"
        },
      ]
    }
  }
]

export default function plan(state = initialState, action) {
  switch (action.type) {
    default:
      return state
  }
}