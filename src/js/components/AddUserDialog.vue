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
  <!-- <div> -->
  <md-dialog :md-active.sync="showDialog" class="add-user-dialog">
    <md-dialog-title>Add New User</md-dialog-title>
    <form
      novalidate
      style="height: calc(100% - 143px)"
      @submit.prevent="validateUser"
    >
      <md-dialog-content class="md-scrollbar add-user-dialog-content">
        <div class="add-user-dialog-field" :class="getValidationClass('email')">
          <md-field :class="getValidationClass('email')">
            <label for="email">Email</label>
            <md-input
              type="email"
              name="email"
              id="email"
              autocomplete="email"
              v-model="form.email"
              required
            />
          </md-field>
          <span class="md-error" v-if="!$v.form.email.required"
            >The email is required</span
          >
          <span class="md-error" v-else-if="!$v.form.email.email"
            >Invalid email</span
          >
        </div>
        <div
          class="add-user-dialog-field"
          :class="getValidationClass('password')"
        >
          <md-field :class="getValidationClass('password')">
            <label for="password">Password</label>
            <md-input
              type="password"
              name="password"
              id="input-create-password"
              autocomplete="Password"
              v-model="form.password"
              required
            />
          </md-field>
          <span class="md-error" v-if="!$v.form.password.required"
            >The Password is required</span
          >
          <span class="md-error" v-else-if="!$v.form.password.password"
            >Invalid Password</span
          >
        </div>

        <div
          class="add-user-dialog-field"
          :class="getValidationClass('repeatPassword')"
        >
          <md-field :class="getValidationClass('repeatPassword')">
            <label for="repeatPassword">Repeat Password</label>
            <md-input
              type="password"
              name="repeatPassword"
              id="repeatPassword"
              autocomplete="repeatPassword"
              v-model="form.repeatPassword"
              required
            />
          </md-field>
          <span class="md-error" v-if="!$v.form.repeatPassword.sameAsPassword"
            >Passwords must be identical</span
          >
          <span class="md-error" v-else-if="!$v.form.repeatPassword.password"
            >Invalid Password</span
          >
        </div>

        <md-field :class="getValidationClass('roles')">
          <label for="roles">Roles</label>
          <md-select
            name="roles"
            id="roles"
            v-model="form.roles"
            md-dense
            multiple
            required
          >
            <md-option
              v-for="userProfile in userProfiles"
              :key="userProfile.id"
              :value="userProfile.id"
              >{{ userProfile.name }}</md-option
            >
          </md-select>
          <span class="md-error">Select at least one role</span>
        </md-field>
      </md-dialog-content>
      <md-progress-bar v-if="sending" md-mode="indeterminate"></md-progress-bar>
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
          <md-button type="submit" class="md-primary">Create user</md-button>
        </div>
      </md-dialog-actions>
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
    </form>
  </md-dialog>
</template>

<script>
import { validationMixin } from "vuelidate";
import { required, sameAs, email, minLength } from "vuelidate/lib/validators";
import { spinalIO } from "../services/spinal-io";
import { copyToClip } from "../utils/copyToClip";
import { generateNewPassword } from "../utils/generateNewPassword";

export default {
  name: "AddUserDialog",
  mixins: [validationMixin],
  props: ["isShown", "userProfiles"],
  data() {
    return {
      form: {
        password: null,
        repeatPassword: null,
        email: null,
        roles: [],
      },
      sending: false,
      showSnackbar: false,
      msgSnackbar: "",
      durationSnackbar: 4000,
    };
  },
  validations: {
    form: {
      password: {
        required,
        minLength: minLength(8),
      },
      roles: {
        required,
        minLength: minLength(1),
      },

      repeatPassword: {
        sameAsPassword: sameAs("password"),
      },
      email: {
        required,
        email,
      },
    },
  },
  // }
  computed: {
    messageClass() {
      return {
        "md-invalid": true,
      };
    },
    showDialog: {
      get() {
        return this.isShown;
      },
      set(value) {
        this.$emit("showStateChange", value);
      },
    },
  },
  methods: {
    copyToClip() {
      copyToClip("#input-create-password");
    },
    generateNewPassword() {
      return (this.input = generateNewPassword(12));
    },

    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName];

      if (field) {
        return {
          "md-invalid": field.$invalid && field.$dirty,
        };
      }
    },
    clearForm() {
      this.$v.$reset();
      this.form.password = null;
      this.form.repeatPassword = null;
      this.form.email = null;
      this.form.roles = [];
    },
    async saveUser() {
      this.sending = true;
      try {
        await spinalIO.createNewAccount(this.form.email, this.form.password);
        await spinalIO.updateRights(this.form.email, this.form.roles);
        await spinalIO.addPublicFolder(this.form.email);

        this.msgSnackbar = `User '${this.form.email}' created successfully.`;
        this.sending = false;
        this.clearForm();
      } catch (e) {
        this.msgSnackbar = e.message;
        this.sending = false;
      }
      this.showSnackbar = true;
    },
    validateUser() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.saveUser();
      }
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
