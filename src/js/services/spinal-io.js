/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import {
  spinalCore,
  File,
  Directory
} from 'spinal-core-connectorjs_type'
import {
  decriAes,
  decriB64
} from '../utils/crypt';
const SpinalUserManager = window.SpinalUserManager;

import {
  UserProfile
} from 'spinal-env-admin-access-rights-manager/src/Models/UserProfile.ts'

import axios from 'axios';

class SpinalIO {
  constructor() {
    this.loadPromise = {};
    this.connectPromise = null;
    this.user = null;
    this.conn = null;
  }

  decriJson(encryptedHex) {
    try {
      const k = [10, 95, 124, 68, 55, 24, 90, 57, 34, 65, 81, 22, 75, 7, 110,
        1
      ];
      const str = decriAes(k, encryptedHex)
      return JSON.parse(str);
    } catch (e) {
      const str = decriB64(encryptedHex)
      try {
        return JSON.parse(str);
      } catch (e) {
        return ""
      }
    }
  }


  getauth() {
    if (this.user !== null) return this.user;
    const encryptedHex = window.localStorage.getItem('spinalhome_cfg');
    this.user = this.decriJson(encryptedHex)
    return this.user;
  }

  connect() {
    // check si une connection au hub est en cours et la cree ou la retourne.
    if (this.connectPromise !== null) {
      return this.connectPromise;
    }
    this.connectPromise = new Promise(async (resolve, reject) => {
      const user = this.getauth(); // get user in local storage
      if (this.user.username) {
        FileSystem.CONNECTOR_TYPE = "Browser";
        try {
          // get le user or admin id (depend de l'interface)
          // 'get_admin_id' pour admin platform
          // 'get_user_id' pour le reste
          const response = await axios.get(`/get_admin_id`, {
            params: {
              u: user.username,
              p: user.password
            }
          })
          // parse user id de la reponse
          this.spinalUserId = parseInt(response.data);
          // enlever le 'http://' ou 'https://'
          // const host = serverHost.replace(/(http:\/\/|https:\/\/)/, "");
          const host = window.location.host;
          // creatation du Filesystem de Spinalcom (+ init connection)
          this.conn = window.spinalCore.connect(
            `http://${this.spinalUserId}:${user.password}@${host}/`
          );
          resolve(this.conn);
          return this.conn;
        } catch (e) {
          // connection fail bad user/password retrun to drive
          window.location = "/html/drive/";
          reject('Authentication Connection Error');
        }
      } else {
        // connection fail bad user/password retrun to drive
        window.location = "/html/drive/";
        reject('Authentication Connection Error');
      }
    });
    return this.connectPromise;
  }
  load(path) {
    if (typeof this.loadPromise[path] !== 'undefined') {
      return this.loadPromise[path];
    }
    this.loadPromise[path] = new Promise(async (resolve, reject) => {
      try {
        await this.connect();
        spinalCore.load(this.conn, path, (model) => {
          resolve(model);
        }, () => {
          throw new Error(`Load Error path: '${path}'`)
        })

      } catch (e) {
        reject(e);
      }
    });
    return this.loadPromise[path];
  }

  loadPtr(ptr) {
    if (ptr instanceof File) return this.loadPtr(ptr._ptr);
    const server_id = ptr.data.value;

    if (typeof this.loadPtr[server_id] !== 'undefined') {
      return this.loadPtr[server_id];
    }
    this.loadPtr[server_id] = new Promise(async (resolve, reject) => {
      try {
        await this.connect();
        this.conn.load_ptr(server_id, (model) => {
          resolve(model);
        }, () => {
          throw new Error(`LoadPtr Error server_id: '${server_id}'`)
        })

      } catch (e) {
        reject(e);
      }
    });
    return this.loadPtr[server_id];
  }

  async createNewAccount(username, password) {
    await this.connect()
    return new Promise((resolve, reject) => {
      SpinalUserManager.new_account(
        "http://" + window.location.host,
        username, password,
        response => {
          let id = parseInt(response);
          resolve(id);
        },
        () => {
          reject(new Error('Create New Account Error'));
        }
      );
    })
  }

  async changeAccountRights(username, right) {
    await this.connect()
    return new Promise((resolve, reject) => {
      SpinalUserManager.change_account_rights_by_admin(
        "http://" + window.location.host,
        username, right, this.spinalUserId, this.user.password,
        response => {
          let id = parseInt(response);
          resolve(id);
        },
        () => {
          reject(new Error('Create New Account Error'));
        }
      );
    })
  }


  updateRights(username, rights) {
    return new Promise(async (resolve, reject) => {
      let count = 0;

      const func = async (first = false) => {
        try {
          const usrProfileModel = await this.getUserProfile(
            username, false)
          const usrProfileLstModel = usrProfileModel.appProfiles;
          for (let idx = 0; idx < rights.length; idx++) {
            const right = rights[idx];
            const item = usrProfileLstModel.detect(el => {
              return el.get() === right;
            });
            if (!item)
              usrProfileLstModel.push(right);
          }
          const rightToDelete = []
          for (let idx = 0; idx < usrProfileLstModel
            .length; idx++) {
            const userRight = usrProfileLstModel[idx]
            if (rights.includes(userRight.get()) === false)
              rightToDelete.push(userRight);
          }
          for (const right of rightToDelete) {
            usrProfileLstModel.remove_ref(right);
          }
          await this.checkUserAdmin(username);
          if (first === false)
            clearInterval(interval)
          resolve(usrProfileModel)
          return true;
        } catch (e) {
          count++;
          if (first === true) return false
          if (count > 10) {
            clearInterval(interval)
            reject(new Error(
              `imposible to get the rightsLst of "${username}"`))
          }
        }
      }
      let interval;
      if (await func(true) === false)
        interval = setInterval(func, 1000);
    })
  }

  getUsers() {
    return this.load('/etc/users')
  }
  async getUserModel(username) {
    const users = await this.getUsers();
    for (let idx = 0; idx < users.length; idx++) {
      const user = users[idx];
      if (user.name.get() === username) return user;
    }
    return undefined;
  }
  getUsersDir() {
    return this.load('/__users__')
  }
  async getUsersModel(usernames) {
    const users = await this.getUsersDir();
    for (const username in usernames) {
      if (usernames.hasOwnProperty(username)) {
        for (let idx = 0; idx < users.length; idx++) {
          const user = users[idx];
          if (user.name.get() === username) {
            usernames[username] = user;
            break;
          }
        }
      }
    }
    return usernames;
  }
  async createPublicDir() {
    const usersDir = await this.getUsersDir();
    const directory = new Directory();
    usersDir.add_file('public', directory, { model_type: 'Directory' });
    return directory;
  }

  async addPublicFolder(username) {
    try {
      const users = await this.getUsersModel({ 'public': null, [username]: null });

      if (users[username] === null) throw new Error('addPublicFolder : user not found.')
      if (!users[username]._info.publicDir) {
        let dir = null;
        if (users['public'] === null) {
          dir = await this.createPublicDir();
        } else {
          dir = await this.loadPtr(users['public']);
        }
        users[username]._info.add_attr('publicDir', new Ptr(dir));
      }
    } catch (e) {
      console.error(e)
    }
  }

  async getAdminUserProfileModel() {
    const usersProfilesDef = await this.getUsersProfilesDef();
    const roleLstModel = usersProfilesDef.users;
    for (let idx = 0; idx < roleLstModel.length; idx++) {
      const roleModel = roleLstModel[idx];
      if (roleModel.name.get() === 'Admin' ||
        roleModel.name.get().toLocaleLowerCase() === 'admin')
        return roleModel;
    }
    return undefined;
  }

  async checkUserAdmin(username) {
    const userModel = await this.getUserModel(username)
    const adminUserProfileMode = await this.getAdminUserProfileModel()

    const usrProfileModel = await this.getUserProfile(username, false)
    const usrProfileLstModel = usrProfileModel.appProfiles;
    const adminRight = usrProfileLstModel.detect((e) => {
      return e.get() === adminUserProfileMode.id.get()
    })
    const ADMIN = 0;
    const USER = 1;
    if (adminRight === undefined && username === this.user.username &&
      (this.user.username === 'root' || this.user.username === 'admin')) {
      usrProfileLstModel.push(adminUserProfileMode.id.get())

    } else {
      if (typeof adminRight !== 'undefined' && userModel.type.get() ===
        USER) {
        await this.changeAccountRights(username, ADMIN)
      } else if (typeof adminRight === 'undefined' && userModel.type.get() ===
        ADMIN) {
        await this.changeAccountRights(username, USER)
      }
    }

  }
  async getUserProfile(user, withAdminCheck = false) {
    const userDir = await this.load('/etc/UserProfileDir')
    for (let index = 0; index < userDir.length; index++) {
      const userFile = userDir[index];
      if (userFile.name.get() === user) {
        if (withAdminCheck === true) {
          return this.loadPtr(userFile).then(async (res) => {
            await this.checkUserAdmin(user, res)
            return res;
          }, () => {
            throw new Error('Undefined User')
          })
        } else {
          return this.loadPtr(userFile)
        }
      }
    }
    throw new Error('Undefined User')
  }
  async createUserProfile(user) {
    const userDir = await this.load('/etc/UserProfileDir')
    const userProfile = new UserProfile()
    userDir.add_file(user, userProfile, {
      model_type: 'UserProfile'
    })
    return userProfile;
  }

  getUsersProfilesDef() {
    return this.load('/etc/config/UserProfileLst')
  }


  changePasswordByAdmin(target, password) {
    return new Promise((resolve, reject) => {
      let options = location.host + "/";
      const user = this.getauth();
      SpinalUserManager.change_password_by_admin(
        options,
        target,
        password,
        this.spinalUserId,
        user.password,
        function () {
          resolve();
        },
        function (err) {
          reject(err);
        }
      );
    })
  }

  deleteUserdByAdmin(target) {
    return new Promise((resolve, reject) => {
      let options = location.host + "/";
      const user = this.getauth();
      SpinalUserManager.delete_account_by_admin(
        options,
        target,
        this.spinalUserId,
        user.password,
        function () {
          resolve();
        },
        function (err) {
          reject(err);
        }
      );
    })
  }

}

export const spinalIO = new SpinalIO();
