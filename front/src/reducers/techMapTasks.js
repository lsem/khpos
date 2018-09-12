const initialState = [
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

export default function techMapTasks(state = initialState, action) {
  switch (action.type) {
    default:
      return state
  }
}
