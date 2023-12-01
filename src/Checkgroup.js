import axios from "axios"
import Cookies from "js-cookie"

export const Checkgroup = async group => {
  const token = Cookies.get("token")

  if (group !== undefined && group !== null && group !== "") {
    if (token) {
      const config = {
        headers: {
          Authorization: "Bearer " + Cookies.get("token")
        }
      }
      try {
        const res = await axios.post("http://localhost:8080/controller/checkGroup", { group: group }, config)
        return res.data
      } catch (err) {
        if (err.response.status === 401) {
          return false
        }
      }
    }
  }
}

export default { Checkgroup }
