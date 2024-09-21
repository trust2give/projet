// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

struct TimeStamp {
  uint256 timestamp;
  uint16 year;
  uint8 month;
  uint8 day;
  uint8 weekday;
  uint8 hour;
  uint8 minute;
  uint8 second;
  string label;
  }

/**
 * @title LibDate
 * @dev Library for Date Management version 1.0.0
 */

library LibDate {
    uint constant DAY_IN_SECONDS = 86400;
    uint constant YEAR_IN_SECONDS = 31536000;
    uint constant LEAP_YEAR_IN_SECONDS = 31622400;
    uint constant HOUR_IN_SECONDS = 3600;
    uint constant MINUTE_IN_SECONDS = 60;
    uint16 constant ORIGIN_YEAR = 1970;

  function beacon_LibDate() public pure returns (string memory) { return "LibDate::1.0.0"; }

  function isLeapYear(uint16 year)
    internal pure
    returns (bool) {
      if (year % 4 != 0) return false;
      if (year % 100 != 0) return true;
      if (year % 400 != 0) return false;
      return true;
      }

  function leapYearsBefore(uint year)
    internal pure
    returns (uint) {
      year -= 1;
      return year / 4 - year / 100 + year / 400;
      }

  function getDaysInMonth(uint8 month, uint16 year)
    internal pure
    returns (uint8) {
      if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) return 31;
      else if (month == 4 || month == 6 || month == 9 || month == 11) return 30;
      else if (isLeapYear(year)) return 29;
      else return 28;
      }

  function parseTimestamp(TimeStamp storage self)
    internal  {
      uint secondsAccountedFor = 0;
      uint buf;
      uint8 i;

      // Year
      self.year = getYear(self.timestamp);
      buf = leapYearsBefore(self.year) - leapYearsBefore(ORIGIN_YEAR);

      secondsAccountedFor += LEAP_YEAR_IN_SECONDS * buf;
      secondsAccountedFor += YEAR_IN_SECONDS * (self.year - ORIGIN_YEAR - buf);

      // Month
      uint secondsInMonth;
      for (i = 1; i <= 12; i++) {
              secondsInMonth = DAY_IN_SECONDS * getDaysInMonth(i, self.year);
              if (secondsInMonth + secondsAccountedFor > self.timestamp) {
                      self.month = i;
                      break;
              }
              secondsAccountedFor += secondsInMonth;
      }

      // Day
      for (i = 1; i <= getDaysInMonth(self.month, self.year); i++) {
        if (DAY_IN_SECONDS + secondsAccountedFor > self.timestamp) {
          self.day = i;
          break;
          }
        secondsAccountedFor += DAY_IN_SECONDS;
        }

      self.hour = getHour(self.timestamp);
      self.minute = getMinute(self.timestamp);
      self.second = getSecond(self.timestamp);
      self.weekday = getWeekday(self.timestamp);
      }

  function getYear(uint timestamp)
    internal pure
    returns (uint16) {
      uint secondsAccountedFor = 0;
      uint16 year;
      uint numLeapYears;

      // Year
      year = uint16(ORIGIN_YEAR + timestamp / YEAR_IN_SECONDS);
      numLeapYears = leapYearsBefore(year) - leapYearsBefore(ORIGIN_YEAR);

      secondsAccountedFor += LEAP_YEAR_IN_SECONDS * numLeapYears;
      secondsAccountedFor += YEAR_IN_SECONDS * (year - ORIGIN_YEAR - numLeapYears);

      while (secondsAccountedFor > timestamp) {
        if (isLeapYear(uint16(year - 1))) secondsAccountedFor -= LEAP_YEAR_IN_SECONDS;
        else secondsAccountedFor -= YEAR_IN_SECONDS;
        year -= 1;
        }
      return year;
    }

  function getHour(uint timestamp) internal pure returns (uint8) { return uint8((timestamp / 60 / 60) % 24); }
  function getMinute(uint timestamp) internal pure returns (uint8) { return uint8((timestamp / 60) % 60); }
  function getSecond(uint timestamp) internal pure returns (uint8) { return uint8(timestamp % 60); }
  function getWeekday(uint timestamp) internal pure returns (uint8) { return uint8((timestamp / DAY_IN_SECONDS + 4) % 7); }

  function toTimestamp(TimeStamp storage self)
    internal  {
      uint16 i;

      // Year
      for (i = ORIGIN_YEAR; i < self.year; i++) {
        if (isLeapYear(i)) self.timestamp += LEAP_YEAR_IN_SECONDS;
        else self.timestamp += YEAR_IN_SECONDS;
      }

      // Month
      uint8[12] memory monthDayCounts;
      monthDayCounts[0] = 31;
      
      if (isLeapYear(self.year)) monthDayCounts[1] = 29;
      else monthDayCounts[1] = 28;

      monthDayCounts[2] = 31;
      monthDayCounts[3] = 30;
      monthDayCounts[4] = 31;
      monthDayCounts[5] = 30;
      monthDayCounts[6] = 31;
      monthDayCounts[7] = 31;
      monthDayCounts[8] = 30;
      monthDayCounts[9] = 31;
      monthDayCounts[10] = 30;
      monthDayCounts[11] = 31;

      for (i = 1; i < self.month; i++) {
        self.timestamp += DAY_IN_SECONDS * monthDayCounts[i - 1];
      }

      self.timestamp += DAY_IN_SECONDS * (self.day - 1);
      self.timestamp += HOUR_IN_SECONDS * (self.hour);
      self.timestamp += MINUTE_IN_SECONDS * (self.minute);
      self.timestamp += self.second;
    }

  function uintToString(uint v)
    internal pure
    returns (string memory str) {
      uint maxlength = 100;
      bytes memory reversed = new bytes(maxlength);
      uint i = 0;
      while (v != 0) {
          v = v / 10;
          reversed[i++] = bytes1(48 + uint8(v % 10));
      }
      bytes memory s = new bytes(i);
      for (uint j = 0; j < i; j++) { s[j] = reversed[i - 1 - j]; }
      str = string(s);
    }

  function appendUintToString(string memory inStr, uint v)
    internal pure
    returns (string memory str) {
      uint maxlength = 100;
      bytes memory reversed = new bytes(maxlength);
      uint i = 0;
      while (v != 0) {
          uint f_remainder = v % 10;
          v = v / 10;
          reversed[i++] = bytes1(48 + uint8(f_remainder));
      }
      bytes memory inStrb = bytes(inStr);
      bytes memory s = new bytes(inStrb.length + i);
      uint j;
      for (j = 0; j < inStrb.length; j++) { s[j] = inStrb[j]; }
      for (j = 0; j < i; j++) { s[j + inStrb.length] = reversed[i - 1 - j]; }
      str = string(s);
    }
}
