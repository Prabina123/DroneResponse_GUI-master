interface Roles {
  roles?: RolesEntity[] | null;
}
interface RolesEntity {
  role: Role;
}
interface Role {
  role_name: string;
  role_description: string;
  drone_count: string | number;
  map_display: string;
  map_display_options?: string[] | null;
}

const roles: Roles = {
  roles: [
    {
      role: {
        role_name: "search_and_detect",
        role_description: "Search and detect",
        drone_count: "user_defined",
        map_display: "true",
        map_display_options: [
          "regions",
          "routes",
        ],
      },
    },
    {
      role: {
        role_name: "saved_mission",
        role_description: "Select a saved mission",
        drone_count: "user_defined",
        map_display: "true",
        map_display_options: [
          "missions",
        ],
      }
    },
    {
      role: {
        role_name: "birds_eye_surveillance",
        role_description: "Surveillance from fixed hover point",
        drone_count: "user_defined",
        map_display: "true",
        map_display_options: [
          "hover_points",
        ],
      },
    },
    {
      role: {
        role_name: "delivery",
        role_description: "Deliver an object to a specific location",
        drone_count: "1",
        map_display: "false",
        map_display_options: [
          "hover_points",
        ],
      },
    },
    {
      role: {
        role_name: "test_role",
        role_description: "testing role",
        drone_count: "",
        map_display: "true",
        map_display_options: [
          "regions",
          "routes",
        ],
      },
    },
  ],
};

// module.exports = roles;
export default roles;
