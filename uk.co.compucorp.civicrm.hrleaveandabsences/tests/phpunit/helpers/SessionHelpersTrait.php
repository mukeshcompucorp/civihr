<?php

trait CRM_HRLeaveAndAbsences_SessionHelpersTrait {

  private function registerCurrentLoggedInContactInSession($contactID) {
    $session = CRM_Core_Session::singleton();
    $session->set('userID', $contactID);
  }

  private function unregisterCurrentLoggedInContactFromSession() {
    $session = CRM_Core_Session::singleton();
    $session->set('userID', null);
  }

  private function setPermissions(array $permissions = []) {
    CRM_Core_Config::singleton()->userPermissionClass->permissions = $permissions;
  }
}
