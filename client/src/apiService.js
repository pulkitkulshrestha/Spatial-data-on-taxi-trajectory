import axios from "axios";

const apiEndpoint = "http://127.0.0.1:5000";

function test() {
  return apiEndpoint + "/test";
}

export async function Text() {
  const { data: docsData } = await axios.get(test());
  return docsData;
}

export const handleFileEvent =  (e) => {
  const formData = new FormData();
  formData.append("file", e.target.files[0]);
  console.log(formData)
  axios({
    method: "POST",
    url: apiEndpoint + "/upload",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
}

export function spatialRange(latitudeFrom, longitudeFrom, latitudeTo, longitudeTo){
  axios({
    method: "GET",
    url: apiEndpoint + `/spatial/${latitudeFrom}/${longitudeFrom}/${latitudeTo}/${longitudeTo}`,
  })
}

export function viewSpatial() {
  return axios({
    method: "GET",
    url: apiEndpoint + `/viewSpatial`,
  })
}
