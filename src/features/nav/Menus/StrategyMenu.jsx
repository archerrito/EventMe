import React from 'react'
import { Menu, Dropdown } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const StrategyMenu = () => {
  return (
        <Menu.Item position="right">
          <Dropdown pointing="top left" text="Strategy">
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to='/goals' text="Goals" icon="user" />
              <Dropdown.Item as={Link} to='/administrative' text="Administrative" icon="settings" />
              <Dropdown.Item as={Link} to='/matrix' text="Growth Matrix" icon="user" />
              <Dropdown.Item as={Link} to='/analytics' text="Analytics Lexicon" icon="settings" />
              <Dropdown.Item as={Link} to='/personas' text="User Personas" icon="user" />
              <Dropdown.Item as={Link} to='/competitors' text="Competitors" icon="settings" />
              <Dropdown.Item as={Link} to='/content' text="Content" icon="user" />
              <Dropdown.Item as={Link} to='/hiring' text="Hiring" icon="settings" />
              <Dropdown.Item as={Link} to='/scorecard' text="Scorecard" icon="user" />
              <Dropdown.Item as={Link} to='/training' text="Training" icon="settings" />
              <Dropdown.Item as={Link} to='/certification' text="Certification" icon="user" />
              <Dropdown.Item as={Link} to='/coaching' text="Coaching" icon="settings" />
              <Dropdown.Item as={Link} to='/compensation' text="Compensation" icon="user" />
              <Dropdown.Item as={Link} to='/metrics' text="Metrics" icon="settings" />
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>
  )
}

export default StrategyMenu
