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
    <md-dialog :md-active.sync="showDialog" class="add-user-dialog">
      <md-dialog-title
        >Edit Password of <strong>{{ userEdit.name }}</strong>
      </md-dialog-title>
      <md-dialog-content class="md-scrollbar add-user-dialog-content">
        <md-field>
          <label for="input">New password</label>
          <md-input
            type="password"
            name="input"
            id="input-password-edit"
            v-model="input"
            required
          />
        </md-field>
      </md-dialog-content>

      <md-dialog-actions class="bottom-bar">
        <div>
          <md-button
            class="appTable-table-cell-btn"
            @click="generateNewPassword"
          >
            <md-icon>shuffle</md-icon> Generate New Password
          </md-button>
          <md-button class="appTable-table-cell-btn" @click="copyToClip">
            <md-icon>content_copy</md-icon> Copy to clipboard
          </md-button>
        </div>
        <div>
          <md-button class="md-primary" @click="showDialog = false"
            >Close</md-button
          >
          <md-button @click="updatePassword" class="md-primary"
            >Update Password</md-button
          >
        </div>
      </md-dialog-actions>
    </md-dialog>
    <md-snackbar
      md-position="center"
      :md-duration="durationSnackbar"
      :md-active.sync="showSnackbar"
      md-persistent
    >
      <span>{{ msgSnackbar }}</span>
      <md-button class="md-primary" @click="showSnackbar = false"
        >close</md-button
      >
    </md-snackbar>
  </div>
</template>

<script>
import { spinalIO } from "../services/spinal-io";
import { copyToClip } from "../utils/copyToClip";
import { generateNewPassword } from "../utils/generateNewPassword";

export default {
  name: "EditPassword",
  props: ["isShown", "userEdit"],

  data() {
    return {
      input: this.generateNewPassword(),
      showSnackbar: false,
      msgSnackbar: "",
      durationSnackbar: 4000,
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
    copyToClip() {
      copyToClip("#input-password-edit");
    },
    generateNewPassword() {
      return (this.input = generateNewPassword(12));
    },
    updatePassword() {
      return spinalIO
        .changePasswordByAdmin(this.userEdit.name, this.input)
        .then(
          () => {
            this.msgSnackbar = "Update password done";
            this.input = "";
            this.showSnackbar = true;
            this.$emit("close");
          },
          (err) => {
            this.msgSnackbar = "Error: Update password failed!";
            this.showSnackbar = true;
          }
        );
    },
  },
};
</script>

<style scope>
.add-user-dialog-content.md-scrollbar::-webkit-scrollbar {
  background-color: #121212;
}
.add-user-dialog-content.md-scrollbar::-webkit-scrollbar-thumb {
  background-color: #737374;
}
.add-user-dialog-content.md-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.add-user-dialog-content.md-scrollbar::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
.add-user-dialog-content {
  max-height: calc(80vh - 137px);
  margin-right: 2px;
  margin-left: 2px;
}
.add-user-dialog {
  width: 768px;
  max-width: 100%;
}
.add-user-dialog-field.md-invalid {
  height: 70px;
}
.add-user-dialog-field.md-invalid > .md-error {
  color: red;
  height: 20px;
  position: relative;
  bottom: 22px;
  font-size: 12px;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.add-user-dialog-field:not(.md-invalid) > .md-error {
  display: none;
}

.add-user-dialog-content input:-internal-autofill-previewed,
.add-user-dialog-content input:-internal-autofill-selected,
.add-user-dialog-content textarea:-internal-autofill-previewed,
.add-user-dialog-content textarea:-internal-autofill-selected,
.add-user-dialog-content select:-internal-autofill-previewed,
.add-user-dialog-content
  select:-internal-autofill-selected
  .add-user-dialog-content
  input:-webkit-autofill,
.add-user-dialog-content input:-webkit-autofill:hover,
.add-user-dialog-content
  input:-webkit-autofill:focus
  .add-user-dialog-content
  textarea:-webkit-autofill,
.add-user-dialog-content
  textarea:-webkit-autofill:hover
  .add-user-dialog-content
  textarea:-webkit-autofill:focus,
.add-user-dialog-content select:-webkit-autofill,
.add-user-dialog-content select:-webkit-autofill:hover,
.add-user-dialog-content select:-webkit-autofill:focus {
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
