import moment from "moment";

export const UpdateList = (patientList, data, res) => {
    let userIndex = patientList.findIndex(x => x.id === data.id)
    let newList = [...patientList]
    newList[userIndex]={...res, ingress_date: moment(res.ingress_date, 'DD/M/YYYY').format('MM/DD/YYYY')}

    return newList
}