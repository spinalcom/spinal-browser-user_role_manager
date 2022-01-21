/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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

export function generateNewPassword(length) {
  var string = 'abcdefghijklmnopqrstuvwxyz';
  var numeric = '0123456789';
  var password = '';
  var character = '';
  while (password.length < length) {
    if (Math.floor(Math.random() * 3)) {
      let entity1 = Math.ceil(string.length * Math.random() * Math.random());
      let hold = string.charAt(entity1);
      hold = entity1 % 2 == 0 ? hold.toUpperCase() : hold;
      character += hold;
    } else {
      let entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
      character += numeric.charAt(entity2);
    }
    password = character;
  }
  return password;
}
