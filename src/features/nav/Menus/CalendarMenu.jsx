import React from 'react'
import { Menu, Dropdown } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const CalendarMenu = () => {
  return (
        <Menu.Item position="right">
          <Dropdown pointing="top left" text="Calendar">
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to='/timeline' text="Timeline" icon="user" />
              <Dropdown.Item as={Link} to='/meetings' text="Meetings" icon="settings" />
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>
  )
}

export default CalendarMenu
