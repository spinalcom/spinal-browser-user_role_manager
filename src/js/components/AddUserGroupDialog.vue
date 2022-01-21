<!--
Copyright 2022 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <div>
    <md-dialog :md-active.sync="showDialog" class="add-user-group-dialog">
      <md-dialog-title>Add new User Role </md-dialog-title>
      <md-dialog-content class="md-scrollbar add-user-group-dialog-content">
        <md-field>
          <label for="input">Role Name</label>
          <md-input type="text" name="input" v-model="input" required />
        </md-field>
        <md-field>
          <label for="input">Description</label>
          <md-input type="text" name="input" v-model="description" required />
        </md-field>
      </md-dialog-content>

      <md-dialog-actions class="bottom-bar">
        <md-button class="md-primary" @click="showDialog = false"
          >Close</md-button
        >
        <md-button @click="confirm" class="md-primary">confirm</md-button>
      </md-dialog-actions>
    </md-dialog>
    <!-- <md-snackbar md-position="center"
                 :md-duration="durationSnackbar"
                 :md-active.sync="showSnackbar"
                 md-persistent>
      <span>{{msgSnackbar}}</span>
      <md-button class="md-primary"
                 @click="showSnackbar = false">close</md-button>
    </md-snackbar> -->
  </div>
</template>

<script>
import { spinalIO } from "../services/spinal-io";
export default {
  name: "AddUserGroupDialog",
  props: ["isShown"],

  data() {
    return {
      input: "",
      description: "",
    };
  },
  computed: {
    showDialog: {
      get() {
        return this.isShown;
      },
      set(value) {
        this.$emit("close");
      },
    },
  },
  methods: {
    confirm() {
      return spinalIO.addNewRole(this.input, this.description).then(
        (lst) => {
          this.description = "";
          this.input = "";
          // this.msgSnackbar = "Update password done";
          // console.log("lst", lst, this.input)
          // this.input = "";
          // this.showSnackbar = true;
          console.log("ok");
          this.$emit("close");
        },
        (err) => {
          console.log(err);

          // this.msgSnackbar = "Error: Update password failed!";
          // this.showSnackbar = true;
        }
      );
    },
  },
};
</script>

<style scope>
.add-user-group-dialog-content.md-scrollbar::-webkit-scrollbar {
  background-color: #121212;
}
.add-user-group-dialog-content.md-scrollbar::-webkit-scrollbar-thumb {
  background-color: #737374;
}
.add-user-group-dialog-content.md-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.add-user-group-dialog-content.md-scrollbar::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
.add-user-group-dialog-content {
  max-height: calc(80vh - 137px);
  margin-right: 2px;
  margin-left: 2px;
}
.add-user-group-dialog {
  width: 768px;
  max-width: 100%;
}
.add-user-group-dialog-field.md-invalid {
  height: 70px;
}
.add-user-group-dialog-field.md-invalid > .md-error {
  color: red;
  height: 20px;
  position: relative;
  bottom: 22px;
  font-size: 12px;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.add-user-group-dialog-field:not(.md-invalid) > .md-error {
  display: none;
}

.add-user-group-dialog-content input:-internal-autofill-previewed,
.add-user-group-dialog-content input:-internal-autofill-selected,
.add-user-group-dialog-content textarea:-internal-autofill-previewed,
.add-user-group-dialog-content textarea:-internal-autofill-selected,
.add-user-group-dialog-content select:-internal-autofill-previewed,
.add-user-group-dialog-content
  select:-internal-autofill-selected
  .add-user-group-dialog-content
  input:-webkit-autofill,
.add-user-group-dialog-content input:-webkit-autofill:hover,
.add-user-group-dialog-content
  input:-webkit-autofill:focus
  .add-user-group-dialog-content
  textarea:-webkit-autofill,
.add-user-group-dialog-content
  textarea:-webkit-autofill:hover
  .add-user-group-dialog-content
  textarea:-webkit-autofill:focus,
.add-user-group-dialog-content select:-webkit-autofill,
.add-user-group-dialog-content select:-webkit-autofill:hover,
.add-user-group-dialog-content select:-webkit-autofill:focus {
  /* background-color: yellow !important; */
  background-image: none !important;
  color: rgb(0, 0, 0) !important;
  -webkit-box-shadow: 0 0 0px 1000px rgba(99, 99, 99, 0.58) inset;
  box-shadow: 0 0 0px 1000px rgba(99, 99, 99, 0.58) inset;
  -webkit-text-fill-color: #070707 !important;
}
.bottom-bar {
  flex-wrap: wrap;
}
</style>

<style>
.md-select-menu.md-menu-content-bottom-start.md-menu-content-small.md-menu-content {
  z-index: 99999;
}
</style>
