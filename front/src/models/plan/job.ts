export default interface Job {
  id: string
  startTime: number
  column: number
  techMap: { id: string, version: number }
  productionQuantity: number
  employeesQuantity: number
  stepAssignments?: Array<{ employeeId: string, stepId: string }>
}