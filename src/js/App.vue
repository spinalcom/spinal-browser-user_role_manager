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
  <div class="mainApp">
    <TableVue
      :users="users"
      :userProfiles="userProfiles"
      :isDisabled="editionDisable"
      @onEditClick="onEditClick"
      @onChange="onUserChange"
    >
      <div slot="edition-bar-buttons">
        <md-button @click="showUserDialog = true">
          <md-icon>person_add</md-icon>
          Add User
        </md-button>
        <md-button @click="showUserGroupDialog = true">
          <md-icon>group_add</md-icon>
          Add Role
        </md-button>
      </div>
    </TableVue>
    <AddUserDialog
      :isShown="showUserDialog"
      :userProfiles="userProfiles"
      @showStateChange="onShowUserDialog"
    >
    </AddUserDialog>
    <AddUserGroupDialog
      :isShown="showUserGroupDialog"
      @close="onShowUserGroupDialog"
    >
    </AddUserGroupDialog>
  </div>
</template>


<script>
import "../css/App.css";
import throttle from "lodash.throttle";
import TableVue from "./components/TableVue.vue";
import AddUserDialog from "./components/AddUserDialog.vue";
import AddUserGroupDialog from "./components/AddUserGroupDialog.vue";
import { spinalIO } from "./services/spinal-io.js";

export default {
  name: "MainUI",
  data() {
    return {
      users: [],
      userProfiles: [],
      editionDisable: true,
      showUserDialog: false,
      showUserGroupDialog: false,
    };
  },
  components: {
    TableVue,
    AddUserDialog,
    AddUserGroupDialog,
  },
  async mounted() {
    this.usersModel = await spinalIO.getUsers();
    this.userProfilesDefModel = await spinalIO.getUsersProfilesDef();
    // bind all models
    this.updateUsersBinded = throttle(
      this.updateUsers.bind(
        this,
        this.usersModel,
        this.userProfilesDefModel.users
      ),
      200
    );
    this.usersModel.bind(this.updateUsersBinded);
    this.userProfilesDefModel.users.bind(this.updateUsersBinded);
    for (let idx = 0; idx < this.usersModel.length; idx++) {
      const userModel = this.usersModel[idx];
      const usrProfileModel = await spinalIO.getUserProfile(
        userModel.name.get(),
        true
      );
      usrProfileModel.bind(this.updateUsersBinded);
    }
    this.updateUsersBinded();
  },
  methods: {
    onShowUserDialog(value) {
      this.showUserDialog = value;
    },
    onShowUserGroupDialog(value) {
      this.showUserGroupDialog = value;
    },
    onEditClick(value) {
      this.editionDisable = value;
    },
    onUserChange(value, userProfilesId, user) {
      var rights = user.userProfiles.reduce(function (filtered, e) {
        if (e.userProfile.id === userProfilesId) {
          if (value === true) filtered.push(e.userProfile.id);
        } else if (e.value === true) {
          filtered.push(e.userProfile.id);
        }
        return filtered;
      }, []);
      spinalIO.updateRights(user.name, rights);
    },
    updateUsers(usersModel, userProfilesDefModel) {
      this.users = [];
      this.userProfiles = [];
      for (let idx = 0; idx < userProfilesDefModel.length; idx++) {
        const element = userProfilesDefModel[idx];
        this.userProfiles.push(element.get());
      }
      const promises = [];
      for (let idx = 0; idx < usersModel.length; idx++) {
        const element = usersModel[idx];
        const userRef = {
          id: element.id.get(),
          name: element.name.get(),
          userProfiles: [],
        };
        for (const userProfile of this.userProfiles) {
          userRef.userProfiles.push({ value: false, userProfile });
        }
        promises.push(this.updateUserProfile(userRef));
        this.users.push(userRef);
      }
      return Promise.all(promises);
    },
    async updateUserProfile(userRef) {
      let usrProfileModel;
      try {
        usrProfileModel = await spinalIO.getUserProfile(userRef.name);
      } catch (e) {
        usrProfileModel = await spinalIO.createUserProfile(userRef.name);
        usrProfileModel.bind(this.updateUsersBinded);
      }
      let userRefIdx = 0;
      for (const userProfile of this.userProfiles) {
        let found = false;
        let idx = 0;
        for (; idx < usrProfileModel.appProfiles.length; idx++) {
          const userProfileLstIdx = usrProfileModel.appProfiles[idx].get();
          if (userProfileLstIdx === userProfile.id) {
            found = true;
            break;
          }
        }
        if (found === true) {
          userRef.userProfiles[userRefIdx].value = true;
        } else {
          userRef.userProfiles[userRefIdx].value = false;
        }
        userRefIdx++;
      }
    },
  },
};
</script>

<style scoped>
.mainApp {
  height: 100vh;
  width: 100vw;
}
</style>
<style>
.md-dialog-container,
.md-dialog-container .md-tabs {
  width: 100%;
}
</style>
