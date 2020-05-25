/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.  All rights reserved.
 ** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
"use strict";
const OutputFormatter = require("./OutputFormatter");
const ActionResultUtils = require("../../utils/ActionResultUtils");
const NodeTranslationService = require("../../services/NodeTranslationService");

const {
   ACCOUNT_TYPE, COMMAND_MANAGE_ACCOUNT: { MESSAGES },
} = require("../../services/TranslationKeys");

const SANDBOX_ACCOUNT_ID_REGEX_PATTERN = ".+_SB\\d*$";
const RELEASE_PREVIEW_ACCOUNT_ID_REGEX_PATTERN = ".+_RP\\d*$";

class ManageAccountOutputFormatter extends OutputFormatter {
   constructor(consoleLogger) {
      super(consoleLogger);
   }

   formatActionResult(actionResult) {
      if (actionResult.resultMessage) {
         ActionResultUtils.logResultMessage(actionResult, this.consoleLogger);
      } else if (Array.isArray(actionResult.data)) {
         actionResult.data.forEach((message) => this.consoleLogger.result(message));
      } else if (actionResult.data instanceof Object) {
         this.logAccountInfo(actionResult.data);
      }
   }

   logAccountInfo(accountCredentials) {
      const accountInfo = accountCredentials.accountInfo;
      this.consoleLogger.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.AUTHID, accountCredentials.authId));
      this.consoleLogger.info(
         NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ACCOUNT_NAME, accountInfo.companyName)
      );
      this.consoleLogger.info(
         NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ACCOUNT_ID, accountInfo.companyId)
      );
      this.consoleLogger.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.ROLE, accountInfo.roleName));
      this.consoleLogger.info(NodeTranslationService.getMessage(MESSAGES.ACCOUNT_INFO.DOMAIN, accountCredentials.domain));
      this.consoleLogger.info(
         NodeTranslationService.getMessage(
            MESSAGES.ACCOUNT_INFO.ACCOUNT_TYPE,
            this._getAccountType(accountInfo.companyId)
         )
      );
   }

   _getAccountType(accountId) {
      if (accountId.match(SANDBOX_ACCOUNT_ID_REGEX_PATTERN)) {
         return NodeTranslationService.getMessage(ACCOUNT_TYPE.SANDBOX);
      } else if (accountId.match(RELEASE_PREVIEW_ACCOUNT_ID_REGEX_PATTERN)) {
         return NodeTranslationService.getMessage(ACCOUNT_TYPE.RELEASE_PREVIEW);
      }
      return NodeTranslationService.getMessage(ACCOUNT_TYPE.PRODUCTION);
   }
}

module.exports = ManageAccountOutputFormatter;
