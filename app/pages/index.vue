<template>
  <div>
    <Navbar />

    <div class="p-5">
      <div class="d-flex align-items-center justify-content-between">
        <h2>Dashboard</h2>

        <button class="py-2 px-3 d-flex align-items-center justify-content-center btn-dark text-light"
          @click.prevent="displayForm">
          <icon-github width="15px" height="15px" type="full" class="me-2" /> Add Repository
        </button>
      </div>

      <div class="row mb-2">
        <div class="col-3">
          Name
        </div>
        <div class="col-3">
          Created Date
        </div>
        <div class="col-3">
          Type
        </div>
      </div>

      <div class="projects-table row py-1" v-for="project in projects" :key="project.name">
        <hr>
        <div class="col-3 project-name">{{project.name}}</div>
        <div class="col-3">{{formatDate(project.createdAt) || ""}}</div>
        <div class="col-3">{{project.type}}</div>
        <div class="col">
          <a v-show="project.repository" :href="project.repository" target="_blank">
            <icon-external width="20px" height="20px" />
          </a>
        </div>
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
  button {
    border: none;
    border-radius: 10px;
    text-transform: capitalize;
    background: none;
    cursor: pointer;

    &.btn-success {
      color: white;
      background: #74B566;

      &:hover {
        background: #438340;
      }
    }

    &.btn-dark {
      background: #333;
    }


  }

  .projects-table {
    .project-name {
      text-transform: capitalize;
    }
  }

</style>

<script>
  export default {
    async asyncData({
      $api
    }) {
      const projects = await $api.$get("/projects")
      console.log(projects)
      return { projects };
    },
    data() {
      return {
        projects: []
      }
    },
    mounted() {
      window.vueInstance = this
    },
    methods: {
      displayForm: function () {
        this.$swal.fire({
          title: 'Submit your Github repository URL',
          input: 'text',
          inputAttributes: {
            autocapitalize: 'off'
          },
          showCancelButton: true,
          confirmButtonText: 'Look up',
          showLoaderOnConfirm: true,
          preConfirm: (repository) => {
            return this.$api.$post("/projects", {
              repository
            })
          },
          allowOutsideClick: () => !this.$swal.isLoading()
        }) //.then((result) => {
        //   if (result.isConfirmed) {
        //     this.$swal.fire({
        //       title: `${result.value.login}'s avatar`,
        //       imageUrl: result.value.avatar_url
        //     })
        //   }
        // })
      },
      formatDate(date) {
        return new Date(date).toLocaleDateString();
      }
    },
  }

</script>
