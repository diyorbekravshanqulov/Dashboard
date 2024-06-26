<template>
  <div class="mb-20">
    <div class="flex items-center justify-between mb-10">
      <h1>User list</h1>
      <!-- Button to open create user dialog -->
      <el-button type="primary" @click="dialogFormVisible = true">
        Create User
      </el-button>
    </div>

    <!-- User Table -->
    <el-table v-loading="loading" :data="users" style="width: 100%">
      <el-table-column type="index" :index="indexMethod" width="50" />
      <el-table-column prop="firstName" label="First Name" />
      <el-table-column prop="lastName" label="Last Name" />
      <el-table-column prop="age" label="Age" />
      <el-table-column prop="phone" label="Phone" />
      <el-table-column fixed="right" label="Operations">
        <template #default="scope">
          <el-popconfirm
            width="220"
            confirm-button-text="OK"
            cancel-button-text="No, Thanks"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="Are you sure to delete this?"
            @confirm="handleDelete(scope.row)"
          >
            <template #reference>
              <el-button type="danger" size="small">Delete</el-button>
            </template>
          </el-popconfirm>
          <!-- Button to edit user (already implemented) -->
          <el-button plain @click="showEditModal(scope.row)">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="flex justify-end mt-10">
      <el-pagination
        v-model="currentPage"
        @current-change="handleCurrentChange"
        background
        layout="total,sizes, prev, pager, next"
        :total="totalUsers"
      />
    </div>

    <!-- Dialog for creating a new user -->
    <el-dialog v-model="dialogFormVisible" title="Create User" width="500">
      <el-form
        :model="newUserForm"
        :rules="newUserFormRules"
        ref="newUserFormRef"
      >
        <el-form-item label="First Name" prop="firstName">
          <el-input v-model="newUserForm.firstName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Last Name" prop="lastName">
          <el-input v-model="newUserForm.lastName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Age" prop="age">
          <el-input v-model="newUserForm.age" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Phone" prop="phone">
          <el-input v-model="newUserForm.phone" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetNewUserForm">Cancel</el-button>
          <el-button type="primary" @click="createUser" >Create</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive } from "vue";
import axios from "axios";
import { ElNotification, ElMessageBox } from "element-plus";

// Axios configuration
const baseURL = "https://dummyjson.com"; // Replace with your API base URL
const api = axios.create({ baseURL });

// Reactive variables
const users = ref([]);
const loading = ref(false);
const totalUsers = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);
const dialogFormVisible = ref(false);

// Form for creating a new user
const newUserForm = reactive({
  firstName: "",
  lastName: "",
  age: null,
  phone: "",
});

// Validation rules for the new user form
const newUserFormRules = reactive({
  firstName: [
    { required: true, message: "Please enter first name", trigger: "blur" },
  ],
  lastName: [
    { required: true, message: "Please enter last name", trigger: "blur" },
  ],
  age: [{ required: true, message: "Please enter age", trigger: "blur" }],
  phone: [
    { required: true, message: "Please enter phone number", trigger: "blur" },
  ],
});

// Function to reset the new user form
const resetNewUserForm = () => {
  newUserForm.firstName = "";
  newUserForm.lastName = "";
  newUserForm.age = null;
  newUserForm.phone = "";
};

// Function to create a new user
const createUser = () => {
  const formRef = refs.newUserFormRef;
  formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      api
        .post("/users/add", newUserForm)
        .then(() => {
          ElNotification.success("User created successfully.");
          resetNewUserForm();
          dialogFormVisible.value = false;
          fetchUsers();
        })
        .catch((err) => {
          console.error("Error creating user:", err);
          ElNotification.error("Failed to create user.");
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      ElNotification.warning("Please fill in all required fields.");
      return false;
    }
  });
};

// Function to fetch users from API
const fetchUsers = () => {
  loading.value = true;
  api
    .get("/users", {
      params: {
        limit: pageSize.value,
        skip: (currentPage.value - 1) * pageSize.value,
      },
    })
    .then((res) => {
      users.value = res.data.users;
      totalUsers.value = res.data.total;
    })
    .catch((err) => {
      console.error("Error fetching users:", err);
    })
    .finally(() => {
      loading.value = false;
    });
};

// Function to handle current page change
const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchUsers();
};

// Function to calculate index in table
const indexMethod = (index) => {
  return (currentPage.value - 1) * pageSize.value + index + 1;
};

// Function to handle delete user
const handleDelete = (user) => {
  ElMessageBox.confirm("Are you sure to delete this user?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(() => {
      loading.value = true;
      api
        .delete(`/users/${user.id}`)
        .then(() => {
          const index = users.value.findIndex((u) => u.id === user.id);
          if (index !== -1) {
            users.value.splice(index, 1);
            totalUsers.value--;
            if (users.value.length === 0 && currentPage.value > 1) {
              currentPage.value--;
              fetchUsers();
            }
            ElNotification.success("User deleted successfully.");
          }
        })
        .catch((err) => {
          console.error("Error deleting user:", err);
          ElNotification.error("Failed to delete user.");
        })
        .finally(() => {
          loading.value = false;
        });
    })
    .catch(() => {
      ElNotification.info("Delete canceled.");
    });
};

// Function to show edit modal (already implemented in your code)
const showEditModal = (user) => {
  // Implementation
};

// Initial fetch of users when component mounts
fetchUsers();
</script>
