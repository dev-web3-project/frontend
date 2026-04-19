import { notifyError, notifySuccess } from "../../components/notify";
import api from "./api";
import apiPublic from "./api-public";

export const getEstablishments = async () => {
  try {
    const response = await api.get("/uni/establishment");
    return response.data;
  } catch (error: any) {
    notifyError(error);
  }
};

export const createEstablishment = async (data: any) => {
  try {
    const response = await api.post("/uni/establishment", data);
    notifySuccess("Établissement créé avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const getEstablishmentById = async (id: string) => {
  try {
    const response = await api.get(`/uni/establishment/${id}`);
    return response.data;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const updateEstablishment = async (id: string, data: any) => {
  try {
    const response = await api.put(`/uni/establishment/${id}/update`, data);
    notifySuccess("Établissement mis à jour avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const deleteEstablishment = async (id: string) => {
  try {
    const response = await api.delete(`/uni/establishment/${id}/delete`);
    notifySuccess("Établissement supprimé avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const getCycles = async () => {
  try {
    const response = await api.get("/uni/cycle");
    return response.data;
  } catch (error: any) {
    notifyError(error);
  }
};

export const createCycle = async (data: any) => {
  try {
    const response = await api.post("/uni/cycle", data);
    notifySuccess("Cycle créé avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const getCycleById = async (id: string) => {
  try {
    const response = await api.get(`/uni/cycle/${id}`);
    return response.data;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const updateCycle = async (id: string, data: any) => {
  try {
    const response = await api.put(`/uni/cycle/${id}/update`, data);
    notifySuccess("Cycle mis à jour avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const deleteCycle = async (id: string) => {
  try {
    const response = await api.delete(`/uni/cycle/${id}/delete`);
    notifySuccess("Cycle supprimé avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const getCyclesByEstablishmentId = async (id: string) => {
  try {
    const response = await api.get(`/uni/establishment/${id}/cycles`);
    return response.data;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const getCyclesWithoutAssigned = async () => {
  try {
    const response = await api.get("/uni/cycle/unassigned");
    return response.data;
  } catch (error: any) {
    notifyError(error);
  }
};

export const unassignCycleFromEstablishment = async (cycleId: string) => {
  try {
    const response = await api.delete(
      `/uni/cycle/${cycleId}/unassign`
    );
    notifySuccess("Cycle désassigné avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const assignCycleToEstablishment = async (
  establishmentId: string,
  cycleId: string
) => {
  const response = await api.post(
    `/uni/establishment/${establishmentId}/cycle/${cycleId}`
  );
  return response.data;
};

export const getClasses = async () => {
  try {
    const response = await api.get("/uni/class");
    return response.data;
  } catch (error: any) {
    notifyError(error);
  }
};

export const createClass = async (data: any) => {
  try {
    const response = await api.post("/uni/class", data);
    notifySuccess("Classe créée avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const getClassById = async (id: string) => {
  try {
    const response = await api.get(`/uni/class/${id}`);
    return response.data;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const updateClass = async (id: string, data: any) => {
  try {
    const response = await api.put(`/uni/class/${id}/update`, data);
    notifySuccess("Classe mise à jour avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const deleteClass = async (id: string) => {
  try {
    const response = await api.delete(`/uni/class/${id}/delete`);
    notifySuccess("Classe supprimée avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const getClassesByCycleId = async (id: string) => {
  try {
    const response = await api.get(`/uni/cycle/${id}/classes`);
    return response.data;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const getClassesWithoutAssigned = async () => {
  try {
    const response = await api.get("/uni/class/unassigned");
    return response.data;
  } catch (error: any) {
    notifyError(error);
  }
};

export const unassignClassFromCycle = async (classId: string) => {
  try {
    const response = await api.delete(
      `/uni/class/${classId}/unassign`
    );
    notifySuccess("Classe désassignée avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const assignClassToCycle = async (
  cycleId: string,
  classId: string
) => {
  const response = await api.post(
    `/uni/cycle/${cycleId}/class/${classId}`
  );
  return response.data;
};

export const getGenies = async () => {
  try {
    const response = await api.get("/uni/genie");
    return response.data;
  } catch (error: any) {
    notifyError(error);
  }
};

export const createGenie = async (data: any) => {
  try {
    const response = await api.post("/uni/genie", data);
    notifySuccess("Génie créé avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const getGenieById = async (id: string) => {
  try {
    const response = await api.get(`/uni/genie/${id}`);
    return response.data;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const updateGenie = async (id: string, data: any) => {
  try {
    const response = await api.put(`/uni/genie/${id}/update`, data);
    notifySuccess("Génie mis à jour avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const deleteGenie = async (id: string) => {
  try {
    const response = await api.delete(`/uni/genie/${id}/delete`);
    notifySuccess("Génie supprimé avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const getGeniesByClassId = async (id: string) => {
  try {
    const response = await api.get(`/uni/class/${id}/genies`);
    return response.data;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const getGeniesWithoutAssigned = async () => {
  try {
    const response = await api.get("/uni/genie/unassigned");
    return response.data;
  } catch (error: any) {
    notifyError(error);
  }
};

export const unassignGenieFromClass = async (genieId: string) => {
  try {
    const response = await api.delete(
      `/uni/genie/${genieId}/unassign`
    );
    notifySuccess("Génie désassigné avec succès");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const assignGenieToClass = async (
  classId: string,
  genieId: string
) => {
  const response = await api.post(
    `/uni/class/${classId}/genie/${genieId}`
  );
  return response.data;
};

export const getDepartments = async () => {
  try {
    const response = await api.get("/uni/department");
    return response.data;
  } catch (error: any) {
    notifyError(error);
  }
};

export const getDepartmentsWithoutAssigned = async () => {
  try {
    const response = await api.get("/uni/department/unassigned");
    return response.data;
  } catch (error: any) {
    notifyError(error);
  }
};

export const getDepartmentById = async (id: string) => {
  try {
    const response = await api.get(`/uni/department/${id}`);
    return response.data;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const createDepartment = async (data: any) => {
  try {
    const response = await api.post("/uni/department", data);
    notifySuccess("Department created successfully");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const updateDepartment = async (id: string, data: any) => {
  try {
    const response = await api.put(`/uni/department/${id}`, data);
    notifySuccess("Department updated successfully");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const deleteDepartment = async (id: string) => {
  try {
    const response = await api.delete(`/uni/department/${id}/delete`);
    notifySuccess("Department deleted successfully");
    return response;
  } catch (error: any) {
    notifyError(error.response.data);
  }
};

export const getPublicDepartment = async () => {
  try {
    const response = await apiPublic.get("/public/uni/departments");
    return response.data;
  } catch (error: any) {
    notifyError(error);
  }
};

export const getFaculties = getEstablishments;
export const createFaculty = createEstablishment;
export const getFacultyById = getEstablishmentById;
export const updateFaculty = updateEstablishment;
export const deleteFaculty = deleteEstablishment;

