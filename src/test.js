import React, { useEffect } from "react"
import { useContext } from "react"
import DispatchContext from "./DispatchContext.js"
import Cookies from "js-cookie"
import axios from "axios"

export const PopulateTables = async => {
  const appDispatch = useContext(DispatchContext)
  //function to populate tables

  // CREATE TABLE `task` (
  //   `Task_name` varchar(50) NOT NULL,
  //   `Task_description` longtext NOT NULL,
  //   `Task_notes` longtext NOT NULL,
  //   `Task_id` varchar(50) NOT NULL,
  //   `Task_plan` varchar(50) DEFAULT NULL,
  //   `Task_app_Acronym` varchar(50) NOT NULL,
  //   `Task_state` varchar(15) NOT NULL,
  //   `Task_creator` varchar(50) NOT NULL,
  //   `Task_owner` varchar(50) NOT NULL,
  //   `Task_createDate` date DEFAULT (curdate()),
  //   PRIMARY KEY (`Task_id`),
  //   KEY `Task_app_Acronym` (`Task_app_Acronym`),
  //   KEY `Task_plan` (`Task_plan`),
  //   CONSTRAINT `task_ibfk_1` FOREIGN KEY (`Task_app_Acronym`) REFERENCES `application` (`App_Acronym`),
  //   CONSTRAINT `task_ibfk_2` FOREIGN KEY (`Task_plan`) REFERENCES `plan` (`Plan_MVP_name`)
  // ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

  const createFakeTaskData = () => {
    const fakeTasks = []
    for (let i = 0; i < 30; i++) {
      fakeTasks.push({
        Task_name: `Task ${i + 1}`,
        Task_description: `This is a description for task ${i + 1}.`,
        Task_notes: `Notes for task ${i + 1}.`,
        Task_app_Acronym: `test`, // Cycles through APP-1 to APP-3
        Task_plan: `Sprint2` // Cycles through Plan 1 to Plan 5
      })
    }
    return fakeTasks
  }

  const populateTasks = async () => {
    const fakeTasks = createFakeTaskData()
    const config = {
      headers: {
        Authorization: "Bearer " + Cookies.get("token")
      }
    }
    fakeTasks.forEach(async task => {
      try {
        await axios.post("http://localhost:8080/controller/createTask", task, config)
        console.log(`Task ${task.Task_id} added successfully.`)
      } catch (error) {
        console.error(`Error adding task ${task.Task_id}:`, error)
      }
    })
  }

  useEffect(() => {
    populateTasks()
  }, [])

  return <></>
}

export default PopulateTables
