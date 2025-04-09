import axios from "../config/axios";

export const courseService = {
    getAllCourses() {
        return axios.get("/courses");
    },

    getCourseById(id) {
        return axios.get(`/courses/${id}`);
    },

    createCourse(courseData) {
        return axios.post("/courses", courseData);
    },

    updateCourse(id, courseData) {
        return axios.put(`/courses/${id}`, courseData);
    },

    deleteCourse(id) {
        return axios.delete(`/courses/${id}`);
    },
};
