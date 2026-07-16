export const UpdateList = (patientList, data, res) => {
    let userIndex = patientList.findIndex(x => x.id === data.id)
    let newList = [...patientList]
    newList[userIndex] = res

    return newList
}